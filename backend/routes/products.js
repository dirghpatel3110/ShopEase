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

    // Prompt OpenAI to Generate Product Details
    const prompt = `
      Generate a JSON object for a unique product with the following structure:
      {
        "name": "string",
        "description": "string",
        "category": "string",
        "accessories": [
          {
            "name": "string",
            "description": "string"
          }
        ]
      }
      Ensure:
      - The product name, description, and all details are unique and creative.
      - The accessories' name and description are also unique and related to the product.
      - Only one accessory should be included in the response.
      Do not include any additional explanation or text. Return only the JSON object.
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
    rawResponse = rawResponse.replace(/^```json|\n```$/g, '').trim(); // Removes the code block markers

    // Parse the cleaned-up response
    let generatedData;
    try {
      generatedData = JSON.parse(rawResponse);
    } catch (error) {
      console.error('Error Parsing JSON:', error.message);
      return res.status(400).json({ message: 'OpenAI did not return valid JSON', error });
    }

    // Check if all necessary fields are present in the generated data
    if (!generatedData.name || !generatedData.description || !generatedData.category || !generatedData.accessories) {
      return res.status(400).json({ message: 'Incomplete product data returned by OpenAI' });
    }

    // Prepare the product data
    const productData = {
      id: id,
      name: generatedData.name,
      description: generatedData.description,
      price: Math.floor(Math.random() * 500) + 50, // Random price between 50 and 550
      retailer_special_discounts: Math.floor(Math.random() * 50), // Random discount
      manufacturer_rebates: Math.floor(Math.random() * 30), // Random rebate
      category: generatedData.category,
      warranty_price: Math.floor(Math.random() * 100) + 20, // Random warranty price between 20 and 120
      likes:  Math.floor(Math.random() * 200) + 5,
      availableItems: Math.floor(Math.random() * 100) + 1, // Random stock between 1 and 100
      image: `https://www.example.com/round-dining-table.jpg`, // Placeholder image
      accessories: generatedData.accessories.map((acc) => ({
        id: id,
        name: acc.name,
        description: acc.description,
        price: Math.floor(Math.random() * 50) + 10, // Random accessory price between 10 and 60
      })),
    };

    // Save the Product to MongoDB
    const newProduct = new Product(productData);
    await newProduct.save();

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
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error.message);
    res.status(500).json({ message: 'Internal server error', error });
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
