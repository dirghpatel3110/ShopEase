const express = require('express');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const Ticket = require('../models/Ticket'); // Import Ticket model
const Transaction = require('../models/Transaction'); 
const fs = require('fs');// Import Transaction model

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post('/tickets', upload.single('ticketImage'), async (req, res) => {
    try {
      const { orderId, description } = req.body; // Get orderId from request body
      const imagePath = req.file ? req.file.path : null;
  
      // Validate required fields
      if (!orderId || !imagePath) {
        return res.status(400).json({ message: 'Order ID and ticket image are required.' });
      }
  
      // Read and convert the image to base64
      const imageBuffer = fs.readFileSync(imagePath);
      const imageBase64 = imageBuffer.toString('base64');
  
      // Check if the transaction exists and has orderStatus "Delivered"
      const transaction = await Transaction.findOne({ orderId });
  
      if (!transaction) {
        return res.status(404).json({ message: 'Order not found. Please check the order ID.' });
      }
  
      if (transaction.orderStatus !== 'Delivered') {
        return res.status(400).json({ message: 'Ticket can only be created for delivered orders.' });
      }
  
      const ticketNumber = `Ticket${Date.now()}`;
  
      // Call OpenAI API to generate decision based on image
      const gptResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `
                You are a customer service assistant for ShopEase, an online shopping platform that sells multiple products across various categories. Based on the uploaded ticket image, decide if the customer is eligible for one of the following outcomes:
  
                - **Replace Product**: If the order arrived wet or defective, replace the product.
                - **Refund Product**: If the order arrived damaged, refund the product.
                - **Escalate to Human Agent**: If no clear issue can be identified or further clarification is required, escalate to a human agent.
  
                **Respond with the decision and a brief reason in one sentence.**
              `,
            },
            {
              role: 'user',
              content: `Ticket image (base64 encoded): ${imageBase64}`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      const decision = gptResponse.data.choices[0].message.content.trim();
  
      // Save ticket in database
      const newTicket = new Ticket({
        ticket_number: ticketNumber,
        order_id: orderId,
        description,
        image_url: imagePath, // Optionally save the image path
        decision,
      });
  
      await newTicket.save();
  
      res.status(201).json({
        message: 'Ticket saved successfully',
        ticketNumber,
        decision,
      });
    } catch (error) {
      console.error('Error saving ticket data:', error);
      res.status(500).json({ message: 'Error saving ticket data', error });
    }
  });
  


router.get('/tickets/:ticketNumber', async (req, res) => {
    try {
      const { ticketNumber } = req.params; // Extract ticket number from URL parameters
  
      // Find the ticket in the database
      const ticket = await Ticket.findOne({ ticket_number: ticketNumber });
  
      if (!ticket) {
        return res.status(404).json({
          message: 'Ticket not found. Please check your ticket number.',
        });
      }
  
      res.status(200).json({
        message: 'Ticket found successfully',
        ticketNumber: ticket.ticket_number,
        decision: ticket.decision || 'Decision not yet available',
        description: ticket.description,
        imageUrl: ticket.image_url,
      });
    } catch (error) {
      console.error('Error fetching ticket:', error);
      res.status(500).json({
        message: 'Error fetching ticket details',
        error: error.message,
      });
    }
  });
  

module.exports = router;
