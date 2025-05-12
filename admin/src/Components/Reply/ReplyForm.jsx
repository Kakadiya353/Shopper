import React, { useState } from 'react';
import axios from 'axios';
import './ReplyForm.css';

const ReplyForm = ({ userData, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        subject: `Re: ${userData.Subject}`,
        message: '',
        to: userData.Email,
        userName: userData.UserName
    });
    const [status, setStatus] = useState({ message: '', type: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/admin/api/reply/send-reply', formData);
            setStatus({
                message: response.data.message || 'Reply sent successfully',
                type: 'success'
            });

            // Call the success callback to refresh the replies list
            if (onSuccess) {
                onSuccess();
            }

            // Close the form after a short delay
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            setStatus({
                message: error.response?.data?.message || 'Error sending reply',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reply-form-container">
            <div className="reply-form-header">
                <h2>Reply to {userData.UserName}</h2>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>

            {status.message && (
                <div className={`status-message ${status.type}`}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>To:</label>
                    <input
                        type="email"
                        name="to"
                        value={formData.to}
                        readOnly
                    />
                </div>

                <div className="form-group">
                    <label>Subject:</label>
                    <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Message:</label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows="6"
                        placeholder="Type your reply here..."
                    />
                </div>

                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className="send-btn" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reply'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReplyForm; 