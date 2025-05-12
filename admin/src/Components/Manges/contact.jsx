import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './contact.css'
// Importing assets
import instagram_icon from '../../assets/instagram_icon.png';
import pintester_icon from '../../assets/pintester_icon.png';
import whatsapp_icon from '../../assets/whatsapp_icon.png';

const ContactAdmin = () => {
    const [contactText, setContactText] = useState({
        Email: '',
        Phone: '',
        Address: '',
        SocialMedia: '',
        CopyRight: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchContactInfo();
    }, []);

    const fetchContactInfo = async () => {
        try {
            const response = await axios.get('http://localhost:5000/admin/api/contact/all-contact');
            if (response.data.contact && response.data.contact.length > 0) {
                setContactText(response.data.contact[0]);
            }
        } catch (error) {
            setError('Failed to fetch contact information');
            console.error('Error fetching contact info:', error);
        }
    };

    // Handle editing content
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setContactText((prevText) => ({
            ...prevText,
            [name]: value,
        }));
    };

    // Handle updating contact information
    const handleUpdate = async () => {
        setMessage('');
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/admin/api/contact/manage-contact', contactText);
            setMessage(response.data.message);
            fetchContactInfo(); // Refresh the data after successful update
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update contact information');
            console.error('Error updating contact info:', error);
        }
    };

    return (
        <div className="contact-us">
            <div className="contact-us-logo">
                <p>SHOPPER</p>
            </div>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            {/* Contact Information Input Fields */}
            <div className="contact-us-inputs">
                <div className="input-group">
                    <label>Email:</label>
                    <input
                        type="text"
                        name="Email"
                        value={contactText.Email}
                        onChange={handleEditChange}
                        placeholder="Enter Email"
                    />
                </div>
                <div className="input-group">
                    <label>Phone:</label>
                    <input
                        type="text"
                        name="Phone"
                        value={contactText.Phone}
                        onChange={handleEditChange}
                        placeholder="Enter Phone"
                    />
                </div>
                <div className="input-group">
                    <label>Address:</label>
                    <input
                        type="text"
                        name="Address"
                        value={contactText.Address}
                        onChange={handleEditChange}
                        placeholder="Enter Address"
                    />
                </div>
                <div className="input-group">
                    <label>Social Media:</label>
                    <input
                        type="text"
                        name="SocialMedia"
                        value={contactText.SocialMedia}
                        onChange={handleEditChange}
                        placeholder="Enter Social Media"
                    />
                </div>
                <div className="input-group">
                    <label>Copyright:</label>
                    <input
                        type="text"
                        name="CopyRight"
                        value={contactText.CopyRight}
                        onChange={handleEditChange}
                        placeholder="Enter Copyright Text"
                    />
                </div>
            </div>

            {/* Render Social Icons */}
            <div className="contact-us-social-icon">
                <div className="contact-us-icons-container">
                    <img src={instagram_icon} alt="Instagram" />
                </div>
                <div className="contact-us-icons-container">
                    <img src={pintester_icon} alt="Pinterest" />
                </div>
                <div className="contact-us-icons-container">
                    <img src={whatsapp_icon} alt="WhatsApp" />
                </div>
            </div>

            {/* Admin Controls */}
            <div className="contact-us-admin-controls">
                <button className="update-btn" onClick={handleUpdate}>Update Contact Information</button>
            </div>
        </div>
    );
};

export default ContactAdmin;
