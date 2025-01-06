import React, { useState, useEffect } from 'react';
import '../CSS/Navbar.css';
import cart_icon from '../Assets/cart_icon.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [role, setRole] = useState('');
  const [activeLink, setActiveLink] = useState('');
  const [showInventoryOptions, setShowInventoryOptions] = useState(false);
  const [showSalesReportOptions, setShowSalesReportOptions] = useState(false);
  const [showCustomerServiceOptions, setShowCustomerServiceOptions] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem('role');

    if (storedRole) {
      setRole(storedRole);
    }

    setActiveLink(location.pathname);
  }, [location]);

  const handleClick = (link) => {
    setActiveLink(link);
    setShowInventoryOptions(false);
    setShowSalesReportOptions(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const toggleInventoryOptions = () => {
    setShowInventoryOptions(!showInventoryOptions);
    setShowSalesReportOptions(false);
  };

  const toggleSalesReportOptions = () => {
    setShowSalesReportOptions(!showSalesReportOptions);
    setShowInventoryOptions(false);
  };

  const toggleCustomerServiceOptions = () => {
    setShowCustomerServiceOptions(!showCustomerServiceOptions);
    setShowInventoryOptions(false);
    setShowSalesReportOptions(false);
  };

  const inventoryOptions = [
    { name: 'Products Available', path: '/inventory/available' },
    { name: 'Bar Chart', path: '/inventory/bar-chart' },
    { name: 'Products on Sale', path: '/inventory/on-sale' },
    { name: 'Products with Manufacturer Rebates', path: '/inventory/rebates' }
  ];

  const salesReportOptions = [
    { name: 'Product Sold', path: '/sales-report/product-sold' },
    { name: 'Bar Chart', path: '/sales-report/bar-chart' },
    { name: 'Daily Sales Transactions', path: '/sales-report/daily-transactions' }
  ];

  const customerServiceOptions = [
    { name: 'Open a Ticket', path: '/customer-service/open-ticket' },
    { name: 'Status of a Ticket', path: '/customer-service/ticket-status' }
  ];

  return (
    <div className='navbar'>
      <div className="nav-logo">
        <Link to="/product">
          <p>𝒮𝒽𝑜𝓅𝐸𝒶𝓈𝑒</p>
        </Link>
      </div>
      <div className="nav-login-cart">
        {role === "Salesman" && (
          <button
            onClick={() => handleClick('/order')}
            style={{
              color: activeLink === '/order' ? 'blue' : '#515151',
            }}
          >
            <Link
              to='/order'
              style={{
                color: activeLink === '/order' ? 'blue' : '#515151',
                textDecoration: 'none',
              }}
            >
              Customer
            </Link>
          </button>
        )}
        {role === "StoreManager" && (
          <>
            <button
              onClick={() => handleClick('/product-list')}
              style={{
                color: activeLink === '/product-list' ? 'blue' : '#515151',
              }}
            >
              <Link
                to='/product-list'
                style={{
                  color: activeLink === '/product-list' ? 'blue' : '#515151',
                  textDecoration: 'none',
                }}
              >
                Product list
              </Link>
            </button>
            <div className="inventory-dropdown">
              <button onClick={toggleInventoryOptions}>Inventory</button>
              {showInventoryOptions && (
                <div className="inventory-options">
                  {inventoryOptions.map((option, index) => (
                    <Link
                      key={index}
                      to={option.path}
                      onClick={() => handleClick(option.path)}
                      style={{
                        color: activeLink === option.path ? 'blue' : '#515151',
                        textDecoration: 'none',
                      }}
                    >
                      {option.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="sales-report-dropdown">
              <button onClick={toggleSalesReportOptions}>Sales Report</button>
              {showSalesReportOptions && (
                <div className="sales-report-options">
                  {salesReportOptions.map((option, index) => (
                    <Link
                      key={index}
                      to={option.path}
                      onClick={() => handleClick(option.path)}
                      style={{
                        color: activeLink === option.path ? 'blue' : '#515151',
                        textDecoration: 'none',
                      }}
                    >
                      {option.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        {role === "Customer" && (
          <>
          <button
            onClick={() => handleClick('/order')}
            style={{
              color: activeLink === '/order' ? 'blue' : '#515151',
            }}
          >  
            <Link
              to='/order'
              style={{
                color: activeLink === '/order' ? 'blue' : '#515151',
                textDecoration: 'none',
              }}
            >
              Order
            </Link>
          </button>
          <div className="customer-service-dropdown">
          <button onClick={toggleCustomerServiceOptions}>Customer Service</button>
          {showCustomerServiceOptions && (
            <div className="customer-service-options">
              {customerServiceOptions.map((option, index) => (
                <Link
                  key={index}
                  to={option.path}
                  onClick={() => handleClick(option.path)}
                  style={{
                    color: activeLink === option.path ? 'blue' : '#515151',
                    textDecoration: 'none',
                  }}
                >
                  {option.name}
                </Link>
              ))}
            </div>
          )}
        </div>
        </>
        )}
        <button onClick={handleLogout}>Logout</button>
        <Link to='/cart'>
          <img src={cart_icon} alt="cart_icon" />
        </Link>
      </div>
    </div>
  );
};

export default Navbar;