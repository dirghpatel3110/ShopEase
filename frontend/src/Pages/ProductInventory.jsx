import React, { useState, useEffect } from "react";
import axios from "axios";
import "../CSS/ProductInventory.css";
import Navbar from "./Navbar";

const ProductInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5001/api/auth/products"
        );
        setInventory(response.data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching inventory data");
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <Navbar />
      <div className="product-inventory">
        <h2>Product Inventory</h2>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Price</th>
              <th>Available Items</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>{item.availableItems}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ProductInventory;
