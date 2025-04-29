import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';
import { toast } from 'react-toastify';

// Set the base URL for API requests
const API_BASE_URL = 'http://localhost:5000/admin';

const Register = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    UserName: '',
    Email: '',
    Password: '',
    Mobile: '',
    Address: '',
    Role: 'admin', // default role
    imageFile: null
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);

      setFormData((prev) => ({
        ...prev,
        imageFile: file
      }));
      console.log(formData.imageFile)
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'imageFile') {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (formData.imageFile) {
        formDataToSend.append('profileImage', formData.imageFile);
      }

      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }


      const response = await axios.post(`${API_BASE_URL}/api/auth/admin/register`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Registration successful! Redirecting...');
        setTimeout(() => {
          navigate('/admin/login');
        }, 1500);
      }
    } catch (error) {
      console.error('Registration failed:', error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h2>Admin Registration</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="UserName">Username</label>
            <input
              type="text"
              id="UserName"
              name="UserName"
              value={formData.UserName}
              onChange={handleChange}
              required
              placeholder="Enter your username"
              autoComplete="username"
              disabled={isUploading}
            />
          </div>

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
              disabled={isUploading}
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
              autoComplete="new-password"
              disabled={isUploading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="Mobile">Mobile</label>
            <input
              type="tel"
              id="Mobile"
              name="Mobile"
              value={formData.Mobile}
              onChange={handleChange}
              required
              placeholder="Enter your mobile number"
              autoComplete="tel"
              disabled={isUploading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="Address">Address</label>
            <textarea
              id="Address"
              name="Address"
              value={formData.Address}
              onChange={handleChange}
              required
              placeholder="Enter your address"
              autoComplete="street-address"
              disabled={isUploading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="profileImage">Profile Image</label>
            <input
              type="file"
              id="profileImage"
              name="profileImage"
              onChange={handleFileChange}
              accept="image/*"
              ref={fileInputRef}
              disabled={isUploading}
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isUploading}
          >
            {isUploading ? 'Registering...' : 'Register'}
          </button>

          <div className="form-footer">
            <p>Already have an account? <Link to="/admin/login">Login here</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
