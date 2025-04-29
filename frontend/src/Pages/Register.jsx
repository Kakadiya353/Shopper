import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    UserName: "",
    Email: "",
    Password: "",
    Mobile: "",
    Address: "",
    ImageURI: null
  });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, ImageURI: file });
    }
  }

  const handleRegister = async () => {
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'ImageURI' && formData[key]) {
          formDataToSend.append('ImageURI', formData[key]);
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch('http://localhost:5000/api/users/add-user', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();
      console.log('Registration Response:', data);

      if (data.status === "success") {
        toast.success('Registration successful! Please login.');
        toast.info('You have been registered successfully!');
        navigate('/login');
      } else {
        toast.error(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Sign Up</h2>
        <div className="form-group">
          <input 
            name="UserName" 
            value={formData.UserName} 
            onChange={changeHandler} 
            type="text" 
            placeholder="Your Name" 
            required
          />
        </div>
        <div className="form-group">
          <input 
            name="Email" 
            value={formData.Email} 
            onChange={changeHandler} 
            type="email" 
            placeholder="Email Address" 
            required
          />
        </div>
        <div className="form-group">
          <input 
            name="Password" 
            value={formData.Password} 
            onChange={changeHandler} 
            type="password" 
            placeholder="Password" 
            required
          />
        </div>
        <div className="form-group">
          <input 
            name="Mobile" 
            value={formData.Mobile} 
            onChange={changeHandler} 
            type="text" 
            placeholder="Mobile Number" 
            required
          />
        </div>
        <div className="form-group">
          <input 
            name="Address" 
            value={formData.Address} 
            onChange={changeHandler} 
            type="text" 
            placeholder="Address" 
            required
          />
        </div>
        <div className="form-group">
          <input 
            type="file" 
            onChange={handleImageChange} 
            accept="image/*"
          />
        </div>
        <button onClick={handleRegister} className="login-btn">Continue</button>
        <p className="register-link">
          Already have an account? <span onClick={() => navigate('/login')}>Login here</span>
        </p>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Register;
