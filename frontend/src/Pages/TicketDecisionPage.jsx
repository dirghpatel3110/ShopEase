import React, { useState } from "react";
import Navbar from "./Navbar";
import "../CSS/TicketDecisionPage.css";

const TicketDecisionPage = () => {
  const [ticketNumber, setTicketNumber] = useState("");
  const [decision, setDecision] = useState("");
  const [message, setMessage] = useState("");

  const handleFetchDecision = async (event) => {
    event.preventDefault();

    if (!ticketNumber) {
      setMessage("Please enter a valid ticket number.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/auth/tickets/${ticketNumber}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setDecision(data.decision);
      setMessage("");
    } catch (error) {
      console.error("Error fetching ticket decision:", error);
      setMessage(`Error: ${error.message}`);
      setDecision("");
    }
  };

  return (
    <>
      <Navbar />
      <div className="ticket-decision-page">
        <h2>Check Ticket Decision</h2>
        <form className="decision-form" onSubmit={handleFetchDecision}>
          <div>
            <label htmlFor="ticketNumber">Ticket Number:</label>
            <input
              type="text"
              id="ticketNumber"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
            />
          </div>
          <button type="submit" className="fetch-btn">
            Get Decision
          </button>
        </form>
        {message && <p>{message}</p>}
        {decision && (
          <div>
            <h3>Decision</h3>
            <p>{decision}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default TicketDecisionPage;
