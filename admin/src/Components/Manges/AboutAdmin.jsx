import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './aboutus.css';
// Importing assets
import instagram_icon from '../../assets/instagram_icon.png';
import pintester_icon from '../../assets/pintester_icon.png';
import whatsapp_icon from '../../assets/whatsapp_icon.png';

const AboutAdmin = () => {
    const [aboutText, setAboutText] = useState({
        companyName: '',
        mission: '',
        vision: '',
        values: '',
        copyright: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchAboutInfo();
    }, []);

    const fetchAboutInfo = async () => {
        try {
            const response = await axios.get('http://localhost:5000/admin/api/about/all-about');
            if (response.data.about && response.data.about.length > 0) {
                setAboutText(response.data.about[0]);
            }
        } catch (error) {
            setError('Failed to fetch about information');
            console.error('Error fetching about info:', error);
        }
    };

    // Handle editing content
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setAboutText((prevText) => ({
            ...prevText,
            [name]: value,
        }));
    };

    // Handle toggle edit mode
    const toggleEditMode = () => {
        setIsEditing(!isEditing);
    };

    // Handle updating about information
    const handleUpdate = async () => {
        setMessage('');
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/admin/api/about/manage-about', aboutText);
            setMessage(response.data.message);
            setIsEditing(false);
            fetchAboutInfo(); // Refresh the data after successful update
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update about information');
            console.error('Error updating about info:', error);
        }
    };

    return (
        <div className="about-us">
            <div className="about-us-logo">
                <p>SHOPPER</p>
            </div>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            {/* Render About Information Links */}
            <ul className="about-us-links">
                {isEditing ? (
                    <>
                        <input
                            type="text"
                            name="companyName"
                            value={aboutText.companyName}
                            onChange={handleEditChange}
                            placeholder="Edit Company Name"
                        />
                        <textarea
                            name="mission"
                            value={aboutText.mission}
                            onChange={handleEditChange}
                            placeholder="Edit Mission"
                        />
                        <textarea
                            name="vision"
                            value={aboutText.vision}
                            onChange={handleEditChange}
                            placeholder="Edit Vision"
                        />
                        <textarea
                            name="values"
                            value={aboutText.values}
                            onChange={handleEditChange}
                            placeholder="Edit Values"
                        />
                    </>
                ) : (
                    <>
                        <li>{aboutText.companyName}</li>
                        <li>{aboutText.mission}</li>
                        <li>{aboutText.vision}</li>
                        <li>{aboutText.values}</li>
                    </>
                )}
            </ul>

            {/* Render Social Icons */}
            <div className="about-us-social-icon">
                <div className="about-us-icons-container">
                    <img src={instagram_icon} alt="Instagram" />
                </div>
                <div className="about-us-icons-container">
                    <img src={pintester_icon} alt="Pinterest" />
                </div>
                <div className="about-us-icons-container">
                    <img src={whatsapp_icon} alt="WhatsApp" />
                </div>
            </div>

            {/* Render Copyright */}
            {isEditing ? (
                <input
                    type="text"
                    name="copyright"
                    value={aboutText.copyright}
                    onChange={handleEditChange}
                    placeholder="Edit Copyright"
                />
            ) : (
                <div className="about-us-copyright">
                    <hr />
                    <p>{aboutText.copyright}</p>
                </div>
            )}

            {/* Admin Controls */}
            <div className="about-us-admin-controls">
                {isEditing ? (
                    <button onClick={handleUpdate}>Save Changes</button>
                ) : (
                    <button onClick={toggleEditMode}>Edit About Us</button>
                )}
            </div>
        </div>
    );
};

export default AboutAdmin;
