import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';
import { toast } from 'react-toastify';

const Profile = () => {
    const navigate = useNavigate();
    const [adminData, setAdminData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        UserName: '',
        Email: '',
        Mobile: '',
        Address: '',
        ImageURI: ''
    });

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const storedAdmin = localStorage.getItem('adminUser');
                if (!storedAdmin) {
                    toast.error('No admin data found. Please login again.');
                    navigate('/admin/login');
                    return;
                }

                const admin = JSON.parse(storedAdmin);
                console.log('Stored admin data:', admin);

                setFormData({
                    UserName: admin.UserName || '',
                    Email: admin.Email || '',
                    Mobile: admin.Mobile || '',
                    Address: admin.Address || '',
                    ImageURI: admin.ImageURI || ''
                });

                setAdminData({
                    ...admin,
                    id: admin.id,
                    UserName: admin.UserName,
                    Email: admin.Email,
                    Mobile: admin.Mobile,
                    Address: admin.Address,
                    ImageURI: admin.ImageURI,
                    Role: admin.Role,
                    Created: admin.Created,
                    LastLogin: admin.LastLogin
                });
            } catch (error) {
                console.error('Error fetching admin data:', error);
                toast.error('Error loading profile data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdminData();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                toast.error('Authentication token not found');
                navigate('/admin/login');
                return;
            }

            const response = await axios.put(
                `http://localhost:5000/admin/api/users/user/${adminData.id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                const updatedAdmin = {
                    ...adminData,
                    ...formData
                };
                localStorage.setItem('adminUser', JSON.stringify(updatedAdmin));
                setAdminData(updatedAdmin);
                setIsEditing(false);
                toast.success('Profile updated successfully');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Error updating profile');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="profile-loading">Loading...</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Admin Profile</h1>
                {/* <button 
                    className="edit-button"
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button> */}
            </div>

            <div className="profile-content">
                <div className="profile-section">
                    <div className="profile-avatar">
                        <img
                            className="avatar-image"
                            src={adminData?.ImageURI ? `http://localhost:5000/public${adminData.ImageURI}` : `http://localhost:5000/${adminData.ImageURI}`}
                            alt="Admin Profile"
                            onError={(e) => {
                                console.log('Image load error, current src:', e.target.src);
                                e.target.onerror = null;
                                e.target.src = '/default-admin-avatar.png';
                            }}
                        />
                    </div>
                    <div className="profile-info">
                        <h2>{adminData?.UserName || 'Admin User'}</h2>
                        <p className="email">{adminData?.Email || 'No email set'}</p>
                        <p className="role">{adminData?.Role || 'Admin'}</p>
                        <p className="status">
                            <span className={`status-badge ${adminData?.Status === 'active' ? 'active' : 'inactive'}`}>
                                {adminData?.Status || 'Active'}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="profile-stats">
                    <div className="stat-card">
                        <h3>Created</h3>
                        <p>{new Date(adminData?.Created).toLocaleDateString()}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Last Login</h3>
                        <p>{new Date(adminData?.LastLogin).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="profile-details">
                    <div className="detail-item">
                        <span className="label">Username</span>
                        <span className="value">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="UserName"
                                    value={formData.UserName}
                                    onChange={handleChange}
                                    required
                                />
                            ) : (
                                adminData?.UserName || 'Not set'
                            )}
                        </span>
                    </div>

                    <div className="detail-item">
                        <span className="label">Email</span>
                        <span className="value">
                            {isEditing ? (
                                <input
                                    type="email"
                                    name="Email"
                                    value={formData.Email}
                                    onChange={handleChange}
                                    required
                                />
                            ) : (
                                adminData?.Email || 'Not set'
                            )}
                        </span>
                    </div>

                    <div className="detail-item">
                        <span className="label">Mobile</span>
                        <span className="value">
                            {isEditing ? (
                                <input
                                    type="tel"
                                    name="Mobile"
                                    value={formData.Mobile}
                                    onChange={handleChange}
                                />
                            ) : (
                                adminData?.Mobile || 'No mobile number set'
                            )}
                        </span>
                    </div>

                    <div className="detail-item">
                        <span className="label">Address</span>
                        <span className="value">
                            {isEditing ? (
                                <textarea
                                    name="Address"
                                    value={formData.Address}
                                    onChange={handleChange}
                                />
                            ) : (
                                adminData?.Address || 'No address set'
                            )}
                        </span>
                    </div> 
                </div>

                {isEditing && (
                    <button
                        type="button"
                        className="save-button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Profile; 