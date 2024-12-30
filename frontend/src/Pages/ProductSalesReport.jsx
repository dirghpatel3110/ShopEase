import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../CSS/ProductSalesReport.css';
import Navbar from './Navbar';

const ProductSalesReport = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/auth/product-sales-report');
        setSalesData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching sales data');
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
    <Navbar/>
    <div className="product-sales-report">
      <h2>Product Sales Report</h2>
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Price</th>
            <th>Items Sold</th>
            <th>Total Sales</th>
          </tr>
        </thead>
        <tbody>
          {salesData.map((product, index) => (
            <tr key={index}>
              <td>{product.productName}</td>
              <td>${product.price.toFixed(2)}</td>
              <td>{product.totalItemsSold}</td>
              <td>${product.totalSales.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
};

export default ProductSalesReport;