const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  ticket_number: { 
    type: String, 
    required: true, 
    unique: true 
  },
  order_id: { 
    type: String, 
    required: true 
  }, 
  description: { 
    type: String, 
    required: true 
  },
  image_url: { 
    type: String 
  },
  decision: { 
    type: String 
  }, 
});

module.exports = mongoose.model('Ticket', TicketSchema);
