import React, { useState, useEffect } from "react";
import axios from "axios";
import "../CSS/DailySalesTransactions.css";
import Navbar from "./Navbar";

const DailySalesTransactions = () => {
  const [dailySales, setDailySales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDailySales = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5001/api/auth/daily-sales-report"
        );
        setDailySales(response.data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching daily sales data");
        setLoading(false);
      }
    };

    fetchDailySales();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <Navbar />
      <div className="daily-sales-transactions">
        <h2>Daily Sales Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Total Sales</th>
            </tr>
          </thead>
          <tbody>
            {dailySales.map((day, index) => (
              <tr key={index}>
                <td>{day.date}</td>
                <td>${day.totalSales.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default DailySalesTransactions;
