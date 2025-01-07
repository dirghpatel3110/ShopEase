require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const { Client } = require('@elastic/elasticsearch');
const axios = require('axios');
const app = express();

const PORT = 5001;

// Environment variables
const MONGO_URI = 'mongodb://localhost:27017/';
const ES_HOST = 'http://localhost:9200';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Set your OpenAI key in a .env file

// Initialize MongoDB client
const mongoClient = new MongoClient(MONGO_URI);
const dbName = 'shopease';
const collectionName = 'products';

// Initialize Elasticsearch client
const esClient = new Client({ node: ES_HOST });

// Elasticsearch index name
const indexName = 'products_index';

// Define Elasticsearch index mapping
const indexMappingProducts = {
  mappings: {
    properties: {
      id: { type: 'integer' },
      name: { type: 'text' },
      description: { type: 'text' },
      price: { type: 'float' },
      retailer_special_discounts: { type: 'integer' },
      manufacturer_rebates: { type: 'integer' },
      warranty_price: { type: 'float' },
      category: { type: 'keyword' },
      likes: { type: 'integer' },
      availableItems: { type: 'integer' },
      image: { type: 'text' },
      accessories: {
        type: 'nested',
        properties: {
          id: { type: 'integer' },
          name: { type: 'text' },
          price: { type: 'float' },
          description: { type: 'text' }
        }
      },
      product_vector: {
        type: 'dense_vector',
        dims: 1536,
        index: false, 
      }
    }
  }
};


// Function to create index in Elasticsearch
const createElasticsearchIndex = async () => {
  const exists = await esClient.indices.exists({ index: indexName });
  if (exists.body) {
    await esClient.indices.delete({ index: indexName });
    console.log(`Deleted existing index: ${indexName}`);
  }
  await esClient.indices.create({
    index: indexName,
    body: indexMappingProducts
  });
  console.log(`Created Elasticsearch index: ${indexName}`);
};

// Function to generate embeddings using OpenAI
const generateEmbedding = async (text) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        input: text,
        model: 'text-embedding-3-small'
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    return response.data.data[0].embedding;
  } catch (error) {
    console.error(`Error generating embedding: ${error.message}`);
    return null;
  }
};

// Fetch products from MongoDB and push to Elasticsearch
const pushProductsToElasticsearch = async () => {
  try {
    const client = await mongoClient.connect();
    const db = client.db(dbName);
    const products = await db.collection(collectionName).find().toArray();

    const actions = [];
    for (const product of products) {
      const embedding = await generateEmbedding(product.description || '');
      if (!embedding) {
        console.error(`Skipping product ${product._id} due to embedding error.`);
        continue;
      }

      const accessories = Array.isArray(product.accessories)
    ? product.accessories.map(accessory => ({
        id: accessory.id || 0,
        name: accessory.name || 'Unknown',
        price: accessory.price || 0,
        description: accessory.description || ''
      }))
    : [];

      // Prepare product document for Elasticsearch
      doc = {
        index: indexName, 
        id: product._id.toString(),
        document :{
          id: product.id || 0,
          name: product.name || 'Unknown',
          description: product.description || '',
          price: product.price || 0.0,
          retailer_special_discounts: product.retailer_special_discounts || 0,
          manufacturer_rebates: product.manufacturer_rebates || 0,
          warranty_price: product.warranty_price || 0.0,
          category: product.category || 'Unknown',
          likes: product.likes || 0,
          availableItems: product.availableItems || 0,
          image: product.image || '',
          //accessories,
          product_vector: embedding
        }
      }
      var ll = await esClient.index(doc);
    }

    if (actions.length > 0) {
      var ll= esClient.bulk({ body: actions });
      console.log(`Indexed ${actions.length / 2} products into Elasticsearch.`);
    } else {
      console.log('No products to index.');
    }
  } catch (error) {
    console.error(`Error pushing products: ${error.message}`);
  }
};

// Start Express server
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await createElasticsearchIndex();
  await pushProductsToElasticsearch();
});

