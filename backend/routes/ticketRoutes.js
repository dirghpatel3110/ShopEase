const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const Ticket = require('../models/Ticket'); // Import Ticket model
const Transaction = require('../models/Transaction'); // Import Transaction model

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

// Create a new ticket
router.post('/tickets', upload.single('ticketImage'), async (req, res) => {
  try {
    const { orderId, description } = req.body;

    // Validate required fields
    if (!orderId || !description || !req.file) {
      return res.status(400).json({ message: 'Order ID, description, and ticket image are required.' });
    }

    // Check if the transaction exists and has orderStatus "Delivered"
    const transaction = await Transaction.findOne({ orderId });

    if (!transaction) {
      return res.status(404).json({ message: 'Order not found. Please check the order ID.' });
    }

    if (transaction.orderStatus !== 'Delivered') {
      return res.status(400).json({ message: 'Ticket can only be created for delivered orders.' });
    }

    // Read file and convert to Base64
    const filePath = req.file.path;
    const imageBase64 = fs.readFileSync(filePath, { encoding: 'base64' });

    const ticketNumber = `Ticket${Date.now()}`;

    // Call OpenAI API to generate decision based on image
    const gptResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              "You are a customer service assistant for a delivery service, equipped to analyze images of packages. " +
              "If a package appears damaged in the image, automatically process a refund according to policy. " +
              "If the package looks wet, initiate a replacement. " +
              "If the package appears normal and not damaged, escalate to agent. " +
              "For any other issues or unclear images, escalate to agent.",
          },
          {
            role: 'user',
            content: `Ticket image in Base64 format: ${imageBase64}`,
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
      image_url: filePath,
      decision,
    });

    await newTicket.save();

    res.status(201).json({
      message: 'Ticket created successfully',
      ticketNumber,
      decision,
    });
  } catch (error) {
    console.error('Error saving ticket data:', error.message || error);
    res.status(500).json({ message: 'Error saving ticket data', error: error.message || error });
  }
});

// Fetch a ticket by its number
router.get('/tickets/:ticketNumber', async (req, res) => {
  try {
    const { ticketNumber } = req.params;

    const ticket = await Ticket.findOne({ ticket_number: ticketNumber });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    res.status(200).json({
      message: 'Ticket found successfully',
      ticketNumber: ticket.ticket_number,
      decision: ticket.decision,
      description: ticket.description,
      image_url: ticket.image_url,
    });
  } catch (error) {
    console.error('Error fetching ticket:', error.message || error);
    res.status(500).json({ message: 'Error fetching ticket details', error: error.message || error });
  }
});

module.exports = router;
