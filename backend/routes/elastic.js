require("dotenv").config();
const express = require("express");
const { Client } = require("@elastic/elasticsearch");
const axios = require("axios");

const router = express.Router();

const esClient = new Client({ node: "http://localhost:9200" });
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

router.get("/search", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required." });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/embeddings",
      {
        input: query,
        model: "text-embedding-ada-002",
      },
      {
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      }
    );

    const queryEmbedding = response.data.data[0].embedding;

    const esResponse = await esClient.search({
      index: "products_index",
      size: 5,
      query: {
        bool: {
          should: [
            {
              script_score: {
                query: { match_all: {} },
                script: {
                  source:
                    "cosineSimilarity(params.queryVector, 'product_vector') + 1.0",
                  params: { queryVector: queryEmbedding },
                },
              },
            },
            {
              multi_match: {
                query,
                fields: ["description^2", "name"],
                fuzziness: "AUTO",
                minimum_should_match: "75%",
              },
            },
          ],
          minimum_should_match: 1,
        },
      },
      _source: [
        "id",
        "name",
        "description",
        "price",
        "retailer_special_discounts",
        "manufacturer_rebates",
        "warranty_price",
        "category",
        "likes",
        "availableItems",
        "image",
      ],
    });

    const results = esResponse.hits.hits.map((hit) => ({
      id: hit._source.id,
      name: hit._source.name,
      description: hit._source.description,
      price: hit._source.price,
      retailer_special_discounts: hit._source.retailer_special_discounts,
      manufacturer_rebates: hit._source.manufacturer_rebates,
      warranty_price: hit._source.warranty_price,
      category: hit._source.category,
      likes: hit._source.likes,
      availableItems: hit._source.availableItems,
      image: hit._source.image,
      score: hit._score,
    }));

    res.json({ results });
  } catch (error) {
    console.error(`Error during semantic search: ${error.message}`);
    res.status(500).json({ error: "Failed to perform semantic search." });
  }
});

module.exports = router;
