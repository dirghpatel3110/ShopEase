import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../CSS/ProductCard.css'; // Assuming styles for ProductCard
import Navbar from './Navbar';
import Chatbot from './Chatbot'; // Navbar component
//import SemanticSearch from './SemanticSearch'; // Semantic Search component
//import SemanticReviews from './SemanticReviews'; // Semantic Reviews component

const Product = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch products on component mount
  useEffect(() => {
    axios.get('http://localhost:5001/api/auth/products')
      .then((response) => {
        setProducts(response.data);
        setFilteredProducts(response.data); 
        const uniqueCategories = [...new Set(response.data.map(product => product.category))];
        setCategories(uniqueCategories);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
      });
  }, []);

  // Handle category filter change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Navigate to trending page
  const handleTrendingButtonClick = () => {
    navigate('/trending');
  };

  // Filter displayed products based on category and search term
  const displayedProducts = selectedCategory === 'All' 
    ? filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredProducts.filter(product => 
        product.category === selectedCategory && 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Handle product click to navigate to the product details page
  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`, { state: { product } });
  };

  return (
    <>
      <Navbar/>
      <Chatbot/>
      <div className="product-container">
        <div className="set-btn">
          <div className="category-filter">
            <label htmlFor="category">Filter by category:</label>
            <select 
              id="category"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="All">All</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>  
          </div>
        </div>

        <button onClick={handleTrendingButtonClick} className="trending-button">
          View Trending
        </button>

        <div className="product-grid">
          {displayedProducts.length > 0 ? (
            displayedProducts.map((product) => (
              <div 
                key={product.id} 
                className="product-card" 
                onClick={() => handleProductClick(product)} 
                style={{ cursor: 'pointer' }}
              >
                <img className="product-image" src={product.image} alt=" Product image" />
                <div className="product-info">
                  <h3>{product.name || product.ProductModelName}</h3>
                  <p className='price'>Price: ${product.price || product.ProductPrice}</p>
                  <p>Category: {product.category || product.ProductCategory}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No products to display.</p>
          )}
        </div>
      </div>
      </>
  );
};

export default Product;
