import React, { useEffect, useState } from "react";
import "../CSS/Cart.css";
import axios from "axios";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const userEmail = localStorage.getItem("email");
  const navigate = useNavigate();

  useEffect(() => {
    if (userEmail) {
      axios
        .get(`http://localhost:5001/api/auth/cart?email=${userEmail}`)
        .then((response) => {
          setCartItems(response.data);
          calculateTotalAmount(response.data);
        })
        .catch((error) => {
          console.error("Error fetching cart items:", error);
        });
    } else {
      console.error("No email found in local storage.");
    }
  }, [userEmail]);

  const calculateTotalAmount = (items) => {
    const total = items.reduce((acc, item) => acc + item.totalAmount, 0);
    setTotalAmount(total);
  };

  const handleCancelOrder = (id) => {
    axios
      .delete(`http://localhost:5001/api/auth/cart/${id}`)
      .then((response) => {
        console.log(response.data.message);

        const updatedCartItems = cartItems.filter((item) => item._id !== id);
        setCartItems(updatedCartItems);

        calculateTotalAmount(updatedCartItems);
      })
      .catch((error) => {
        console.error("Error canceling order:", error);
      });
  };
  const handleClearCart = () => {
    axios
      .delete(`http://localhost:5001/api/auth/cart?email=${userEmail}`)
      .then((response) => {
        alert(response.data.message);
        setCartItems([]);
        setTotalAmount(0);
      })
      .catch((error) => {
        console.error("Error clearing cart:", error);
      });
  };

  const handleCheckOut = () => {
    navigate("/transaction", { state: { cartItems, totalAmount } });
  };

  return (
    <>
      <Navbar />
      <div className="cart-page">
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <table className="order-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Accessories</th>
                  <th>Total Price</th>
                  <th>Cancel Order</th>
                </tr>
              </thead>
              <tbody className="cart-items-list">
                {cartItems.map((item) => (
                  <tr key={item._id} className="cart-item">
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>
                      {item.accessories.length > 0 ? (
                        <ul className="accessory-list">
                          {item.accessories.map((accessory, index) => (
                            <li key={index} className="accessory-item">
                              {accessory.name} - ${accessory.price} x{" "}
                              {accessory.quantity}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span>No Accessories</span>
                      )}
                    </td>
                    <td>${item.totalAmount.toFixed(2)}</td>
                    <td>
                      <button
                        className="cancel-button"
                        onClick={() => handleCancelOrder(item._id)}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="check">
              <div className="total-amount">
                Total Amount: ${totalAmount.toFixed(2)}
              </div>
              <button onClick={handleClearCart} className="clear-cart-button">
                Clear Cart
              </button>
              <button onClick={handleCheckOut} className="proceed-checkout">
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Cart;
