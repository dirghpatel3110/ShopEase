const express = require('express');
const Product = require('../models/Product');
const OpenAI = require('openai');
const router = express.Router();



const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Replace with your OpenAI API key
});

// Helper Function to Generate Unique Random ID
const generateRandomId = async () => {
  let isUnique = false;
  let randomId;

  while (!isUnique) {
    randomId = Math.floor(Math.random() * 99999) + 1000; // Random number between 1 and 99999
    const existingProduct = await Product.findOne({ id: randomId });
    if (!existingProduct) {
      isUnique = true;
    }
  }

  return randomId;
};

// API Endpoint to Generate and Store Product Details
router.post('/product-ai', async (req, res) => {
  try {
    const id = await generateRandomId();

    // Updated prompt for OpenAI to generate all product and accessory details
    const prompt = `
      Generate a JSON object for a unique product with the following structure:
      {
        "name": "string",
        "description": "string",
        "category": "string",
        "price": "number",
        "retailer_special_discounts": "number",
        "manufacturer_rebates": "number",
        "warranty_price": "number",
        "likes": "number",
        "availableItems": "number",
        "image": "string",
        "accessories": [
          {
            "id": "number",
            "name": "string",
            "description": "string",
            "price": "number"
          }
        ]
      }
      Ensure:
      - The product name, description, category, and all details are unique and creative.
      - The price, discounts, rebates, warranty_price, likes, availableItems are all random but realistic values.
      - Product must have only one accessories,
      - Accessories should have a unique id(numeric), name, description, and price.
      - The image should be a valid image URL.
      - The response should be a valid JSON object with no additional text or explanation.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
    });

    // Extract the raw response
    let rawResponse = response.choices[0].message.content.trim();

    // Clean up the response by removing unwanted characters
    rawResponse = rawResponse.replace(/^```json|\n```$/g, '').trim();

    // Parse the cleaned-up response
    let generatedData;
    try {
      generatedData = JSON.parse(rawResponse);
    } catch (error) {
      console.error('Error Parsing JSON:', error.message);
      return res.status(400).json({ message: 'OpenAI did not return valid JSON', error });
    }

    // Check if all necessary fields are present in the generated data
    if (
      !generatedData.name ||
      !generatedData.description ||
      !generatedData.category ||
      typeof generatedData.price !== 'number' ||
      !Array.isArray(generatedData.accessories)
    ) {
      return res.status(400).json({ message: 'Incomplete product data returned by OpenAI' });
    }

    // Assign unique IDs to accessories if not already included
    generatedData.accessories = generatedData.accessories.map((acc) => ({
      id: acc.id || generateRandomId(),
      ...acc,
    }));

    // Assign a unique ID to the product
    const productData = {
      id: id,
      ...generatedData, // Use all generated fields from OpenAI
    };
    const newProduct = new Product(productData);

    res.status(200).json({
      success: true,
      data: newProduct,
    });
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(500).json({ message: 'Internal server error', error });
  }
});



// Create a new product
router.post('/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Get a single product by ID
router.get('/products/:id', async (req, res) => {
  try {
    // Find the product by its "id" field
    const product = await Product.findOne({ id: req.params.id });
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Update a product by ID
router.put('/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true } // Return the updated document
    );
    if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product updated successfully', updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Delete a product by ID
router.delete('/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({ id: req.params.id });
    if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

module.exports = router;
