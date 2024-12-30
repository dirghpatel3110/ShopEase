import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const ProductsWithRebates = () => {
  const [productsWithRebates, setProductsWithRebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductsWithRebates = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/auth/products');
        setProductsWithRebates(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching products with rebates');
        setLoading(false);
      }
    };

    fetchProductsWithRebates();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
    <Navbar/>
    <div className="products-with-rebates">
      <h2>Products with Manufacturer Rebates</h2>
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Original Price</th>
            <th>Rebate Amount</th>
          </tr>
        </thead>
        <tbody>
          {productsWithRebates.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>${product.price}</td>
              <td>${product.manufacturer_rebates}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
};

export default ProductsWithRebates;