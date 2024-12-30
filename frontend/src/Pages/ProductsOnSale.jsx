import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const ProductsOnSale = () => {
  const [productsOnSale, setProductsOnSale] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductsOnSale = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/auth/products');
        setProductsOnSale(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching products on sale');
        setLoading(false);
      }
    };

    fetchProductsOnSale();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
    <Navbar/>
    <div className="products-on-sale">
      <h2>Products On Sale</h2>
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Original Price</th>
            <th>Discount</th>
          </tr>
        </thead>
        <tbody>
          {productsOnSale.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>${product.price}</td>
              <td>${product.retailer_special_discounts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
};

export default ProductsOnSale;