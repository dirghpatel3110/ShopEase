import React, { useState, useEffect } from "react";
import axios from "axios";
import "../CSS/Order.css";
import Navbar from "./Navbar";

export default function Order() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmPop, setShowConfirmPop] = useState(false);
  const [showUpdatePop, setShowUpdatePop] = useState(false);
  const [orderToRemove, setOrderToRemove] = useState(null);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [role, setRole] = useState(null);
  const [showCreateAccountPop, setShowCreateAccountPop] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Customer",
    password: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    userAge: "",
    userGender: "",
  });

  useEffect(() => {
    // Get user role and email from local storage
    const storedRole = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    setRole(storedRole);

    if (!storedRole) {
      setError("User role not found.");
      setLoading(false);
      return;
    }

    if (storedRole === "Customer") {
      if (!email) {
        setError("Email not found. Please log in.");
        setLoading(false);
        return;
      }

      // Fetch order items for a specific customer using email
      axios
        .get(`http://localhost:5001/api/auth/user-orders?email=${email}`)
        .then((response) => {
          if (response.data && response.data.length > 0) {
            setProducts(response.data);
          } else {
            setError("No orders found for this customer.");
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching order items for customer:", error);
          setError("Failed to fetch orders. Please try again later.");
          setLoading(false);
        });
    } else if (storedRole === "Salesman") {
      // Fetch all order items for Salesman
      axios
        .get("http://localhost:5001/api/auth/order-items")
        .then((response) => {
          if (response.data && response.data.length > 0) {
            setProducts(response.data);
          } else {
            setError("No orders found.");
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching order items for salesman:", error);
          setError("Failed to fetch orders. Please try again later.");
          setLoading(false);
        });
    }
  }, []);

  const handleRemove = (orderId) => {
    axios
      .delete(`http://localhost:5001/api/auth/transactions/${orderId}`)
      .then((response) => {
        // Update the product list after removal
        setProducts(products.filter((product) => product.transactionId?.orderId !== orderId));
        cancelRemove(); // Close the popup after successful removal
      })
      .catch((error) => {
        console.error("Error removing order:", error);
        alert("Failed to remove order.");
      });
  };

  // Open the remove confirmation popup
  const handleOpenRemovePop = (orderId) => {
    setOrderToRemove(orderId); // Set the order ID to be removed
    setShowConfirmPop(true); // Show the confirmation popup
  };

  // Cancel the remove process and close the popup
  const cancelRemove = () => {
    setShowConfirmPop(false); // Hide the confirmation popup
    setOrderToRemove(null); // Reset the order ID to be removed
  };
  const handleUpdate = (orderId, newStatus) => {
    const updateUrl = `http://localhost:5001/api/auth/transactions/${orderId}`; // Use orderId in the URL

    axios
      .put(updateUrl, {
        orderStatus: newStatus, // Pass orderStatus in the request body
      })
      .then((response) => {
        // Update the product list with the new status
        setProducts(
          products.map((product) =>
            product.orderId === orderId
              ? { ...product, orderStatus: newStatus }
              : product
          )
        );
        setShowUpdatePop(false);
        setOrderToUpdate(null);
        setNewStatus("");
      })
      .catch((error) => {
        console.error("There was an error updating the order:", error.message);
        setError("Failed to update order. Please try again.");
      });
  };

  // Open the update popup with the current order details
  const handleOpenUpdatePop = (orderId, currentStatus) => {
    setOrderToUpdate(orderId);
    setNewStatus(currentStatus);
    setShowUpdatePop(true);
  };

  // Cancel the update process and close the popup
  const cancelUpdate = () => {
    setShowUpdatePop(false);
    setOrderToUpdate(null);
    setNewStatus("");
  };
  const handleCreateAccount = () => {
    setShowCreateAccountPop(true);
  };

  const handleAccountSubmit = () => {
    const signupUrl = `http://localhost:5001/api/auth/signup`;

    axios
      .post(signupUrl, formData)
      .then((response) => {
        alert("Account created successfully");
        setShowCreateAccountPop(false);
        setFormData({
          name: "",
          email: "",
          role: "",
          password: "",
          street: "",
          city: "",
          state: "",
          zipCode: "",
          userAge: "",
          userGender: "",
        });
      })
      .catch((error) => {
        console.error(
          "There was an error creating the account:",
          error.message
        );
        setError("Failed to create account. Please try again.");
      });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const cancelCreateAccount = () => {
    setShowCreateAccountPop(false);
    setFormData({ name: "", email: "", role: "", password: "" });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <Navbar />
      {role === "Salesman" && (
        <div className="Acc">
          <button onClick={handleCreateAccount}>Create Account</button>
        </div>
      )}
      <div className="list-product1">
        {/* Header Section */}
        <div className="listproduct-format-main1">
          <p>Customer Name</p>
          <p>Order ID</p>
          <p>Delivery Date</p>
          {role === "Salesman" ? (
            <>
              <p>Update Order</p>
              <p>Remove</p>
            </>
          ) : (
            <>
              <p>Order Status</p>
              <p>Cancel Order</p>
            </>
          )}
        </div>

        {/* Order Items */}
        {products.map((product) => (
          <div key={product.transactionId?.email} className="listproduct-item">
            <p>{product.transactionId?.name}</p>
            <p>{product.transactionId?.orderId}</p>
            <p>
              {new Date(
                product.transactionId?.orderDeliveryDate
              ).toLocaleDateString()}
            </p>

            {role === "Salesman" ? (
              <>
                {/* Update Order Button */}
                <button
                  className="update-order"
                  onClick={() =>
                    handleOpenUpdatePop(
                      product.transactionId?.orderId,
                      product.transactionId?.orderStatus || "Pending"
                    )
                  }
                >
                  Update Order
                </button>

                {/* Remove Button */}
                <button
                  className="remove-button"
                  onClick={() => handleOpenRemovePop(product.transactionId?.orderId)}
                >
                  Remove
                </button>
              </>
            ) : (
              <>
                {/* Customer View */}
                <p>{product.transactionId?.orderStatus || "Pending"}</p>
                {["Placed", "Shipped", "Delivered"].includes(
                  product.transactionId?.orderStatus
                ) ? (
                  <p>No actions available</p>
                ) : (
                  /* Cancel Order Button */
                  <button
                    className="remove-button"
                    onClick={() => handleOpenRemovePop(product.transactionId?.orderId)}
                  >
                    Cancel
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {showUpdatePop && (
        <div className="update-pop1">
          <div className="update-pop-content1">
            <p>Update status for order {orderToUpdate}:</p>
            <select
              onChange={(e) => setNewStatus(e.target.value)}
              value={newStatus}
            >
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
            <button className="cancel-button" onClick={cancelUpdate}>
              Cancel
            </button>
            <button
              className="confirm-button"
              onClick={() => handleUpdate(orderToUpdate, newStatus)}
            >
              Update
            </button>
          </div>
        </div>
      )}

      {showConfirmPop && (
        <div className="confirm-pop">
          <div className="confirm-pop-content">
            <h3>Are you sure you want to remove this order?</h3>
            <p>Order ID: {orderToRemove}</p>

            {/* Action Buttons */}
            <div className="popup-actions">
              <button onClick={() => handleRemove(orderToRemove)}>
                Yes, Remove
              </button>
              <button onClick={cancelRemove}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showCreateAccountPop && (
        <div className="create-account-pop1">
          <div className="create-account-pop-content1">
            <p>Create New Account:</p>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleFormChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleFormChange}
            />
            <input
              type="text"
              name="Customer"
              placeholder="Type of role"
              value={formData.role}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleFormChange}
            />
            <input
              type="text"
              name="street"
              placeholder="street"
              value={formData.street}
              onChange={handleFormChange}
            />
            <input
              type="text"
              name="city"
              placeholder="city"
              value={formData.city}
              onChange={handleFormChange}
            />
            <input
              type="text"
              name="state"
              placeholder="state"
              value={formData.state}
              onChange={handleFormChange}
            />
            <input
              type="text"
              name="zipCode"
              placeholder="Zip Code"
              value={formData.zipCode}
              onChange={handleFormChange}
            />
            <input
              type="text"
              name="userAge"
              placeholder="User Age"
              value={formData.userAge}
              onChange={handleFormChange}
            />
            <input
              type="text"
              name="userGender"
              placeholder="User Gender"
              value={formData.userGender}
              onChange={handleFormChange}
            />
            <button className="cancel-button" onClick={cancelCreateAccount}>
              Cancel
            </button>
            <button className="confirm-button" onClick={handleAccountSubmit}>
              Create
            </button>
          </div>
        </div>
      )}
    </>
  );
}
