import React, { useState } from "react";
import axios from "axios";
import "../CSS/Signup.css";
import { Link } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    userAge: "",
    userGender: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const signup = async () => {
    formData.role = "Customer";

    try {
      const response = await axios.post(
        "http://localhost:5001/api/auth/signup",
        JSON.stringify(formData),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        window.location.replace("/");
      } else {
        alert(response?.data?.errors);
      }
    } catch (error) {
      console.error("There was an error during the sign-up process", error);
      alert("Sign-up failed. Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <h1 className="signup-title">Sign Up</h1>
      <div className="signup-fields">
        <input
          className="signup-input"
          name="name"
          value={formData.name}
          onChange={changeHandler}
          type="text"
          placeholder="Your Name"
          autoComplete="off"
        />
        <input
          className="signup-input"
          name="email"
          value={formData.email}
          onChange={changeHandler}
          type="email"
          placeholder="Email Address"
          autoComplete="off"
        />
        <input
          className="signup-input"
          name="password"
          value={formData.password}
          onChange={changeHandler}
          type="password"
          placeholder="Password"
        />
        <input
          className="signup-input"
          name="userAge"
          value={formData.userAge}
          onChange={changeHandler}
          type="text"
          placeholder="Enter the Age"
        />
        <input
          className="signup-input"
          name="userGender"
          value={formData.userGender}
          onChange={changeHandler}
          type="text"
          placeholder="Enter the Gender"
        />
        <input
          className="signup-input"
          name="street"
          value={formData.street}
          onChange={changeHandler}
          type="text"
          placeholder="Enter the street"
        />
        <input
          className="signup-input"
          name="city"
          value={formData.city}
          onChange={changeHandler}
          type="text"
          placeholder="Enter the city"
        />
        <input
          className="signup-input"
          name="state"
          value={formData.state}
          onChange={changeHandler}
          type="text"
          placeholder="Enter the state"
        />
        <input
          className="signup-input"
          name="zipCode"
          value={formData.zipCode}
          onChange={changeHandler}
          type="number"
          placeholder="Enter the zipCode"
        />
      </div>
      <button className="signup-button" onClick={() => signup()}>
        Continue
      </button>
      <p className="signup-login-redirect">
        Already have an account?{" "}
        <Link to="/" className="signup-link">
          Login here
        </Link>
      </p>
    </div>
  );
};

export default Signup;
