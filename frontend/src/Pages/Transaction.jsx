import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import "../CSS/Transaction.css";
import axios from 'axios';

const Transaction = () => {
  const location = useLocation();
  const { cartItems, totalAmount } = location.state; // Get cart data passed from Cart page

  const [deliveryOption, setDeliveryOption] = useState('home_delivery');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: '',
    state: '',
    zipCode: '',
    creditCardNumber: '',
    cvv: '',
    storeId: '', // For Pickup Option
  });

  const [stores, setStores] = useState([]); // List of stores

  // Fetch store list when delivery option changes to "pickup"
  React.useEffect(() => {
    if (deliveryOption === 'pickup') {
      axios.get('http://localhost:5001/api/auth/store')
        .then((response) => {
          setStores(response.data);
        })
        .catch((error) => {
          console.error('Error fetching store list:', error);
        });
    }
  }, [deliveryOption]);

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const payload = {
        ...formData,
        deliveryOption,
        cartId: cartItems.map((item) => item._id), // Pass all cart item IDs
      };
  
      if (deliveryOption === 'pickup' && !formData.storeId) {
        alert('Please select a store for pickup.');
        return;
      }
  
      // Call backend API to create a transaction
      const response = await axios.post('http://localhost:5001/api/auth/transactions', payload);
  
      alert('Transaction created successfully!');
      console.log(response.data);
  
      // Clear the cart after successful transaction
      await axios.delete(`http://localhost:5001/api/auth/cart?email=${formData.email}`);
      
      alert('Cart cleared successfully!');
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Failed to create transaction.');
    }
  };
  

  return (
    <div>
      <h1>Complete Your Transaction</h1>

      {/* Delivery Option Selection */}
      <div>
        <label>
          <input
            type="radio"
            name="deliveryOption"
            value="home_delivery"
            checked={deliveryOption === 'home_delivery'}
            onChange={() => setDeliveryOption('home_delivery')}
          />
          Home Delivery
        </label>
        <label>
          <input
            type="radio"
            name="deliveryOption"
            value="pickup"
            checked={deliveryOption === 'pickup'}
            onChange={() => setDeliveryOption('pickup')}
          />
          Pickup
        </label>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Common Fields */}
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
        </div>

        <div>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
        </div>

        {/* Address Fields for Home Delivery */}
        {deliveryOption === 'home_delivery' && (
          <>
            <div><label>City:</label><input type="text" name="city" value={formData.city} onChange={handleInputChange} required /></div>
            <div><label>State:</label><input type="text" name="state" value={formData.state} onChange={handleInputChange} required /></div>
            <div><label>Zip Code:</label><input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} required /></div>
          </>
        )}

        {/* Store Selection for Pickup */}
        {deliveryOption === 'pickup' && (
          <>
            <label>Select Store:</label>
            <select name="storeId" value={formData.storeId} onChange={handleInputChange}>
              <option value="">Select Store</option>
              {stores.map(store => (
                <option key={store._id} value={store._id}>
                  {store.street}, {store.city}, {store.state}, {store.zipCode}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Payment Fields */}
        <div><label>Credit Card Number:</label><input type="text" name="creditCardNumber" value={formData.creditCardNumber} onChange={handleInputChange} required /></div>

        <div><label>CVV:</label><input type="text" name="cvv" value={formData.cvv} onChange={handleInputChange} required /></div>

        {/* Submit Button */}
        <button type="submit">Submit Order</button>
      </form>

      {/* Display Total Amount */}
      <h3>Total Amount: ${totalAmount.toFixed(2)}</h3>
    </div>
  );
};

export default Transaction;
