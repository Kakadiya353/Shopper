import React, { useRef, useState, useEffect } from 'react';
import './Navbar.css';
import logo from '../Assets/logo.png';
import cart_icon from '../Assets/cart_icon.png';
import profile_icon from '../Assets/nav-profile.svg';
import { Link, useNavigate } from 'react-router-dom';

import nav_dropdown from '../Assets/nav_dropdown.png';
import { useAuth } from '../../Context/AuthContext';
import axios from 'axios';

const Navbar = () => {
  const [menu, setMenu] = useState("shop");
  const menuRef = useRef();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const [cartCount, setCartCount] = useState(0)
  const token = localStorage.getItem('token');


  const countCartDocs = () => {
    axios.get('http://localhost:5000/api/cart/cart-count', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,

      },
    })
      .then((response) => {
        setCartCount(response.data.itemCount || 0);
      })
      .catch((error) => {
        console.error('Error fetching cart count:', error);
        setCartCount(0);
      });
  }

  useEffect(() => {
    countCartDocs(); // Load once when Navbar mounts

    const handleCartUpdate = () => {
      countCartDocs(); // Re-fetch cart count when cart is updated
    };

    // Listen for the custom cartUpdated event
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, );



  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.profile-dropdown')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const dropdown_toggle = (e) => {
    menuRef.current.classList.toggle('nav-menu-visible');
    e.target.classList.toggle('open');
  };



  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/login');
  };

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className='navbar'>
      <div className='nav-logo'>
        <img src={logo} alt="logo" />
        <p>SHOPPER</p>
      </div>

      <img className='nav-dropdown' onClick={dropdown_toggle} src={nav_dropdown} alt="menu" />
      <ul ref={menuRef} className="nav-menu">
        <li onClick={() => setMenu('shop')}><Link to='/'>Shop</Link>{menu === 'shop' && <hr />}</li>
        <li onClick={() => setMenu('mens')}><Link to='/mens'>Men</Link>{menu === 'mens' && <hr />}</li>
        <li onClick={() => setMenu('womens')}><Link to='/womens'>Women</Link>{menu === 'womens' && <hr />}</li>
        <li onClick={() => setMenu('kids')}><Link to='/kids'>Kids</Link>{menu === 'kids' && <hr />}</li>
      </ul>

      <div className="nav-login-cart">
        {!isAuthenticated ? (
          <Link to='/login'><button>Login</button></Link>
        ) : (
          <div className="profile-dropdown">
            <img
              src={user?.ImageURI ? `http://localhost:5000${user.ImageURI}` : profile_icon}
              alt="Profile"
              onClick={handleProfileClick}
              className="profile-icon"
            />
            {showDropdown && (
              <div className="dropdown-content">
                <Link to="/profile" onClick={() => setShowDropdown(false)}>My Profile</Link>
                <Link to="/change-password" onClick={() => setShowDropdown(false)}>Change Password</Link>
                <Link to="/OrderHistory" onClick={() => setShowDropdown(false)}>Order History</Link>
                <Link to="/contact" onClick={() => setShowDropdown(false)}>Contact Us</Link>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        )}
        <Link to='/cart'><img src={cart_icon} alt="Cart" /></Link>
        <div className="nav-cart-count">{cartCount}</div>
      </div>
    </div>
  );
};

export default Navbar;
