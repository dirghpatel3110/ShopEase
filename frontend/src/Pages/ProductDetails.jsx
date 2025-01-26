import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import "../CSS/ProductDetails.css";

const ProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;
  const [quantity, setQuantity] = useState(0);
  const [accessoryQuantities, setAccessoryQuantities] = useState(
    product.accessories.map(() => 0)
  );
  const [warranty, setWarranty] = useState(false);

  const calculateTotal = () => {
    const discount =
      product.price -
      (product.retailer_special_discounts + product.manufacturer_rebates);
    const productTotal = discount * quantity;
    const accessoriesTotal = accessoryQuantities.reduce((total, qty, index) => {
      return total + qty * product.accessories[index].price;
    }, 0);
    const warrantyTotal = warranty ? product.warranty_price : 0;

    const totalAfterDiscount = productTotal + accessoriesTotal + warrantyTotal;

    return { totalAfterDiscount, discount };
  };

  const handleQuantityChange = (e) => {
    setQuantity(Number(e.target.value));
  };

  const handleAccessoryQuantityChange = (index, value) => {
    const updatedQuantities = [...accessoryQuantities];
    updatedQuantities[index] = Number(value);
    setAccessoryQuantities(updatedQuantities);
  };

  const handleWarrantyChange = (e) => {
    setWarranty(e.target.checked);
  };

  const handleAddToCart = async () => {
    const email = localStorage.getItem("email");

    if (!email) {
      alert("User email is not available. Please log in.");
      return;
    }

    const cartData = {
      email,
      id: product.id,
      name: product.name,
      originalPrice: product.price,
      discountedPrice: calculateTotal().discount,
      totalAmount: calculateTotal().totalAfterDiscount,
      category: product.category,
      quantity,
      accessories: product.accessories
        .map((accessory, index) => ({
          id: accessory.id,
          name: accessory.name,
          price: accessory.price,
          quantity: accessoryQuantities[index],
        }))
        .filter((accessory) => accessory.quantity > 0),
    };

    try {
      await axios.post("http://localhost:5001/api/auth/cart", cartData);

      navigate("/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add items to the cart. Please try again.");
    }
  };

  const { totalAfterDiscount, discount } = calculateTotal();

  return (
    <>
      <Navbar />
      <div className="product-details-page">
        <div className="product-info-section">
          <div className="product-image-section">
            <img
              className="product-image-details"
              src={product.image}
              alt={product.name}
            />
          </div>
          <div className="product-details-text">
            <h2 className="product-title">{product.name}</h2>
            <p className="product-description">{product.description}</p>
            <p className="price-strike">Price: ${product.price}</p>
            <p className="original-price">
              <span className="discount-applied">
                Discounted Price: ${discount}
              </span>
            </p>
            <p className="product-category">Category: {product.category}</p>
            <p className="available-items">
              only <strong>{product.availableItems}</strong> Items are left
            </p>
            <div className="quantity-section">
              <label htmlFor="quantity" className="quantity-label">
                Quantity:
              </label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="quantity-input"
              />
            </div>
            <div className="warranty-section">
              <label htmlFor="warranty" className="warranty-label">
                Add 1 Year Warranty ($ {product.warranty_price}):
              </label>
              <input
                type="checkbox"
                id="warranty"
                checked={warranty}
                onChange={handleWarrantyChange}
                className="warranty-checkbox"
              />
            </div>
          </div>
        </div>

        <div className="accessories-section">
          <h3 className="accessories-title">Accessories</h3>
          {product.accessories.length > 0 ? (
            <div className="accessory-list">
              {product.accessories.map((accessory, index) => (
                <div key={accessory.id} className="accessory-item">
                  <p className="accessory-name">Name: {accessory.name}</p>
                  <p className="accessory-price">Price: ${accessory.price}</p>
                  <p className="accessory-description">
                    Description: {accessory.description}
                  </p>
                  <div className="accessory-quantity-section">
                    <label
                      htmlFor={`accessory-quantity-${index}`}
                      className="accessory-quantity-label"
                    >
                      Quantity:
                    </label>
                    <input
                      type="number"
                      id={`accessory-quantity-${index}`}
                      min="0"
                      value={accessoryQuantities[index]}
                      onChange={(e) =>
                        handleAccessoryQuantityChange(index, e.target.value)
                      }
                      className="accessory-quantity-input"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No accessories available for this product.</p>
          )}
        </div>

        <div className="total-section">
          <div className="total-left">
            <h3 className="total-amount">
              Total Amount: ${totalAfterDiscount}
            </h3>
          </div>
          <div className="total-right">
            <button className="add-to-cart-button" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
