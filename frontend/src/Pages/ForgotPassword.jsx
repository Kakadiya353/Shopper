import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CSS/ForgotPassword.css';

const ForgotPassword = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const defaultEmail = params.get('email') || ''; // Optional, for pre-filling if email exists in the query string
    const [email, setEmail] = useState(defaultEmail);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/users/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const data = await response.json();
                console.error('API error:', data.message); // Log the error message
                toast.error(data.message || 'Failed to send reset link');
                return;
            }

            toast.success('Password reset link sent to your email');
        } catch (error) {
            console.error('Forgot password error:', error); // Log the error
            toast.error('An error occurred');
        }
    };

    return (
        <div className="forgot-container">
            <div className="forgot-box">
                <h2>Forgot Password</h2>
                <p className="info-text">Enter your registered email to reset your password.</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Enter your registered email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="submit-btn">Send Reset Link</button>
                </form>
                <div className="back-login">
                    <p>Remember your password? <a href="/login">Back to Login</a></p>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default ForgotPassword;
