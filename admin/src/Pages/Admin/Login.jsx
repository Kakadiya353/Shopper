import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';
import { toast } from 'react-toastify';
import './message.css'

// Set the base URL for API requests
const API_BASE_URL = 'http://localhost:5000/admin';

const Login = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("adminUser"));
    if (admin) {
      navigate("/admin/dashboard"); // or your protected route
    }
  }, []);

  const [formData, setFormData] = useState({
    Email: '',
    Password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Log the form data being sent
      console.log('Sending login request with data:', formData);

      const response = await axios.post(`${API_BASE_URL}/api/auth/admin/login`, formData);
      if (response.data.success) {
        // Store the token
        localStorage.setItem('adminToken', response.data.token);

        // Log the login response for debugging
        console.log('Login response:', response.data);

        // Use the user data from the login response
        const userData = response.data.user;
        console.log('User data from login response:', userData);

        // Store the complete admin data with all fields from user model
        const adminData = {
          id: userData.id || userData._id,
          UserName: userData.UserName || 'Admin User',
          Email: userData.Email || formData.Email,
          Role: userData.Role || 'admin',
          Created: userData.Created || new Date().toISOString(),
          LastLogin: userData.LastLogin || new Date().toISOString(),
          Mobile: userData.Mobile || '',
          Address: userData.Address || '',
          ImageURI: userData.ImageURI || '',
          Status: userData.Status || 'active'
        };

        // Store the complete admin data in localStorage
        localStorage.setItem('adminUser', JSON.stringify(adminData));

        // Log the stored data for verification
        console.log('Stored admin data:', adminData);
        setStatusMessage('Login successful! Redirecting...')


        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
        setIsLoading(true)
      }
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message || error.message);

      // Provide more detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);

        // Show a more specific error message
        if (error.response.status === 400) {
          setStatusMessage('Invalid email or password. Please check your credentials and try again.')

        } else if (error.response.status === 401) {
          setStatusMessage('Unauthorized. Please check your credentials and try again.')

        } else if (error.response.status === 404) {

          setStatusMessage('Login service not found. Please contact the administrator.')

        } else if (error.response.status === 500) {

          setStatusMessage('Server error. Please try again later.')

        } else {

          setStatusMessage(error.response.data?.message || 'Login failed. Please try again.')

        }
      } else if (error.request) {
        // The request was made but no response was received

        console.error('Error request:', error.request);
        setStatusMessage('No response from server. Please check your internet connection.')

      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        setStatusMessage('An error occurred. Please try again.')

      }
    }
  };

  return (
    <div className="admin-login-container">

      <div className="admin-login-box">
        {statusMessage && (
          <div className={`status-message ${isLoading ? "success" : "error"}`}>
            {statusMessage}
          </div>
        )}

        <h2>Admin Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="Email">Email</label>
            <input
              type="email"
              id="Email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              autoComplete="email"
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="Password">Password</label>
            <input
              type="password"
              id="Password"
              name="Password"
              value={formData.Password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="form-footer">
            <p>Don't have an account? <Link to="/admin/register">Register here</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
