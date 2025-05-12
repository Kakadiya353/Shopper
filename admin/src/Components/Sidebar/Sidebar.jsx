import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import { Link, useNavigate } from 'react-router-dom';
import add_product_icon from '../../assets/add_product_icon.png';
import cart_icon from '../../assets/cart.svg';
import manage_users_icon from '../../assets/manage_users_icon.png';
import manage_offers_icon from '../../assets/manage_offers_icon.png';
import home_icon from '../../assets/home_icon.png';
import order_icon from '../../assets/icons8-order-50.png';
import navlogo from '../../assets/nav-logo.svg'
import more_icon from '../../assets/icons8-more-40.png'
import about_icon from '../../assets/icons8-about-us-30.png'
import contact_icon from '../../assets/icons8-contact-us-50.png'
import response_icon from '../../assets/icons8-response-100.png'
import { Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import manage_icon from '../../assets/icons8-manage-100.png'
import expense_icon from '../../assets/icons8-expense-64.png'
import inventory_icon from '../../assets/icons8-inventory-64.png'
import profile_icon from '../../assets/icons8-name-48.png'
import { getAdminUser, logout } from '../../utils/auth';

const Sidebar = () => {
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const [showMoreOptions, setShowMoreOptions] = useState(false);
    const [adminUser, setAdminUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Get admin user data using the utility function
        const user = getAdminUser();

        if (!user) {
            // If no user data, redirect to login
            navigate('/admin/login');
            return;
        }

        setAdminUser(user);
    }, [navigate]);

    const handleLogout = () => {
        // Use the logout utility function
        logout(navigate);
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminToken');

        // Redirect to login page if navigate function is provided
        if (navigate) {
            navigate('/admin/login');
        } else {
            window.location.href = '/admin/login';
        }
    };

    const toggleSidebar = () => {
        setSidebarVisible(!isSidebarVisible); // Toggle sidebar visibility
    };

    const toggleMoreOptions = () => {
        setShowMoreOptions(!showMoreOptions); // Toggle visibility of floating buttons
    };

    return (
        <>
            {/* Toggle button with hamburger icon */}
            <button onClick={toggleSidebar} className="sidebar-toggle-btn">
                ☰
            </button>

            <div className={`sidebar ${isSidebarVisible ? 'active' : ''}`}>
                <div className="navbar">
                    <img src={navlogo} alt="" className='nav-logo' />
                    <Link to={'/Admin/dashboard'} style={{ textDecoration: 'none' }}>
                        <img src={home_icon} alt="Home" className='home-logo' />
                    </Link>
                    <Dropdown>
                        <Dropdown.Toggle variant="secondary" className="profile-dropdown">
                            <img
                                src={adminUser?.ImageURI ? `http://localhost:5000/public${adminUser.ImageURI}` : profile_icon}
                                alt="Profile"
                                className='home-logo'
                            />
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="dropdown-menu">
                            <Dropdown.Item as={Link} to="/admin/profile">Profile</Dropdown.Item>
                            {/* <Dropdown.Item as={Link} to="/settings">Settings</Dropdown.Item> */}
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                <Link to={'/admin/addproduct'} style={{ textDecoration: 'none' }}>
                    <div className="sidebar-item">
                        <img src={add_product_icon} alt="Add Product" />
                        <p>Products</p>
                    </div>
                </Link>

                <Link to={'/admin/cartproduct'} style={{ textDecoration: 'none' }}>
                    <div className="sidebar-item">
                        <img src={cart_icon} alt="Carts" />
                        <p>Carts</p>
                    </div>
                </Link>

                <Link to={'/admin/manageusers'} style={{ textDecoration: 'none' }}>
                    <div className="sidebar-item">
                        <img src={manage_users_icon} alt="Users" />
                        <p>Users</p>
                    </div>
                </Link>

                <Link to={'/admin/manageoffers'} style={{ textDecoration: 'none' }}>
                    <div className="sidebar-item">
                        <img src={manage_offers_icon} alt="Offers" />
                        <p>Offers</p>
                    </div>
                </Link>

                <Link to={'/admin/manageorders'} style={{ textDecoration: 'none' }}>
                    <div className="sidebar-item">
                        <img src={order_icon} alt="Orders" />
                        <p>Orders</p>
                    </div>
                </Link>

                <Link to={'/admin/expense'} style={{ textDecoration: 'none' }}>
                    <div className="sidebar-item">
                        <img src={expense_icon} alt="Expense" />
                        <p>Expense</p>
                    </div>
                </Link>

                <Dropdown>
                    <Dropdown.Toggle variant="secondary" className="sidebar-item">
                        <img src={manage_icon} alt="Manage" />
                        <span>Manage</span>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="dropdown-menu">
                        <Dropdown.Item as={Link} to="/admin/inventory" className="dropdown-item sidebar-item floating-item">
                            <img src={inventory_icon} alt="Inventory" />
                            <p>Inventory</p>
                        </Dropdown.Item>

                        <Dropdown.Item as={Link} to="/admin/reply" className="dropdown-item sidebar-item floating-item">
                            <img src={response_icon} alt="Response to Users" />
                            <p>Response to Users</p>
                        </Dropdown.Item>

                        <Dropdown.Item as={Link} to="/admin/contact" className="dropdown-item sidebar-item floating-item">
                            <img src={contact_icon} alt="Manage ContactUs" />
                            <p>Contact Us</p>
                        </Dropdown.Item>

                        <Dropdown.Item as={Link} to="/admin/about" className="dropdown-item sidebar-item floating-item">
                            <img src={about_icon} alt="Manage AboutUs" />
                            <p>About Us</p>
                        </Dropdown.Item>

                    </Dropdown.Menu>
                </Dropdown>

            </div>
        </>
    );
};

export default Sidebar;
