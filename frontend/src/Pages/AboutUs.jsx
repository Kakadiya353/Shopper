// src/components/AboutUs.jsx
import React from 'react';
import './CSS/AboutUs.css';

const AboutUs = () => {
    return (
        <div className="about-us-container">
            <div className="about-us-content">
                <h1>About Us</h1>
                <p>
                    Welcome to our company! We are passionate about providing the best services to our customers. Our team works hard to ensure that every project is delivered with excellence and efficiency.
                </p>
                <p>
                    Our company was founded with the vision of creating solutions that make a difference. Over the years, we have expanded our services to meet the evolving needs of our clients.
                </p>
                <h2>Our Mission</h2>
                <p>
                    Our mission is to provide innovative and reliable solutions that drive success for our customers. We aim to build lasting relationships and deliver exceptional value through our services.
                </p>
                <h2>Our Values</h2>
                <ul>
                    <li>Integrity</li>
                    <li>Innovation</li>
                    <li>Excellence</li>
                    <li>Customer Satisfaction</li>
                </ul>
            </div>
        </div>
    );
};

export default AboutUs;
