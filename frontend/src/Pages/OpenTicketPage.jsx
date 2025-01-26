import React, { useState } from "react";
import Navbar from "./Navbar";
import "../CSS/OpenTicketPage.css";

const OpenTicketPage = () => {
  const [orderId, setOrderId] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!orderId || !description || !image) {
      setMessage("Please fill in all fields and upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("orderId", orderId);
    formData.append("description", description);
    formData.append("ticketImage", image);

    try {
      const response = await fetch("http://localhost:5001/api/auth/tickets", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setMessage(data.message);
      setTicketNumber(data.ticketNumber);

      if (data.ticketNumber) {
        alert(
          `Ticket Number: ${data.ticketNumber}. Keep it for future reference.`
        );
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <Navbar />
      <div className="open-ticket-page">
        <h2>Create a Ticket</h2>
        <form className="open-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="orderId">Order ID:</label>
            <input
              type="text"
              id="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="image">Upload Image:</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
          </div>
          <button className="open-btn" type="submit">
            Submit
          </button>
        </form>

        {message && <p className="message">{message}</p>}
        {ticketNumber && (
          <div className="ticket-info">
            <h3>Generated Ticket</h3>
            <p>Ticket Number: {ticketNumber}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default OpenTicketPage;
