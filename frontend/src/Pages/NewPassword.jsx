import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CSS/NewPassword.css';

const NewPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/users/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword }) // ✅ Corrected key
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Password has been reset successfully! Redirecting to login...');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch (err) {
            console.error('Reset password error:', err);
            setError('An error occurred');
        }
    };

    return (
        <div className="reset-container">
            <div className="reset-box">
                <h2>Set New Password</h2>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="reset-btn" disabled={!newPassword || !confirmPassword}>
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NewPassword;
