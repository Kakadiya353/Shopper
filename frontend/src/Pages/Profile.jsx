import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import './CSS/Profile.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    UserName: '',
    Email: '',
    Mobile: '',
    Address: '',
    ImageURI: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user || !user.id) {
          navigate('/login');
          return;
        }

        const response = await fetch(`http://localhost:5000/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        console.log('Fetched user data:', data);

        setUserData(data);
        setFormData({
          UserName: data.UserName || '',
          Email: data.Email || '',
          Mobile: data.Mobile || '',
          Address: data.Address || '',
          ImageURI: data.ImageURI || null
        });
        if (data.ImageURI) {
          setImagePreview(`http://localhost:5000/public${data.ImageURI}`);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, ImageURI: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (!user || !user.id) {
        toast.error('User ID not found. Please try logging in again.');
        return;
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'ImageURI' && formData[key]) {
          formDataToSend.append('ImageURI', formData[key]);
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch(`http://localhost:5000/api/users/update-user/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend,
      });

      const data = await response.json();
      console.log('Update Response:', data);

      if (data.status === "success") {
        toast.success('Profile updated successfully!');
        setUserData(data.user);
        setFormData({
          UserName: data.user.UserName || '',
          Email: data.user.Email || '',
          Mobile: data.user.Mobile || '',
          Address: data.user.Address || '',
          ImageURI: data.user.ImageURI || null
        });
        if (data.user.ImageURI) {
          setImagePreview(`http://localhost:5000/public${data.user.ImageURI}`);
        }
        setIsEditing(false);
      } else {
        toast.error(data.message || 'Update failed. Please try again.');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Update failed. Please try again.');
    }
  };

  if (loading) {
    return <div className="profile-container">Loading...</div>;
  }

  if (error) {
    return <div className="profile-container">{error}</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-box">
        <h2>Profile</h2>
        {userData && (
          <form className="profile-form" onSubmit={handleUpdate}>
            <div className="profile-image">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile" 
                  className="profile-pic"
                />
              ) : (
                <div className="profile-pic-placeholder">
                  <span>No Image</span>
                </div>
              )}
            </div>
            {isEditing ? (
              <>
                <div className="form-group">
                  <input
                    type="text"
                    name="UserName"
                    value={formData.UserName}
                    onChange={handleChange}
                    placeholder="Name"
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="Mobile"
                    value={formData.Mobile}
                    onChange={handleChange}
                    placeholder="Mobile"
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="Address"
                    value={formData.Address}
                    onChange={handleChange}
                    placeholder="Address"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="profile-image" className="image-upload-label">
                    Change Profile Picture
                  </label>
                  <input
                    id="profile-image"
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="image-upload-input"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="update-btn">
                    Update Profile
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="profile-details">
                  <p><strong>Name:</strong> {userData.UserName}</p>
                  <p><strong>Email:</strong> {userData.Email}</p>
                  <p><strong>Mobile:</strong> {userData.Mobile}</p>
                  <p><strong>Address:</strong> {userData.Address}</p>
                </div>
                <div className="profile-actions">
                  <button type="button" onClick={handleEdit} className="edit-btn">
                    Edit Profile
                  </button>
                  <button type="button" onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Profile;
