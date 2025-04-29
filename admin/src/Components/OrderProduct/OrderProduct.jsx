import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './OrderProduct.css';
import ViewDetails from '../ViewDetails/ViewDetails';
import "../../assets/details.css";
import ReusableDataTable from '../ReusableDataTable ';

const OrderProducts = () => {
    const [orders, setOrders] = useState([]);
    const [statusMessage, setStatusMessage] = useState("");
    const [userData, setUserData] = useState("");
    const [statusType, setStatusType] = useState("");
    const [selectedRow, setSelectedRow] = useState(null);
    const [editingOrderId, setEditingOrderId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [errors, setErrors] = useState({});
    const [totalOrders, setTotalOrders] = useState(0);
    const [formData, setFormData] = useState({
        ProductID: '',
        Quantity: '',
        UserName: '',
        DeliveryAddress: '',
        OrderDateTime: '',
        TotalAmount: '',
        OfferName: '',
        DiscountAmount: '',
        ActualAmount: ''
    });

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/admin/api/users/all-user');
            if (response.data && Array.isArray(response.data.user)) {
                setUserData(response.data.user);
                console.log(userData)
            } else if (Array.isArray(response.data)) {
                setUserData(response.data);
                console.log(userData)
            } else {
                console.error('Unexpected API response structure:', response.data);
                console.log(userData)
                setUserData([]);
                setStatusMessage('Error: Unexpected data format from user API');
                setStatusType('error');
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            setUserData([]);
            setStatusMessage('Error fetching user');
            setStatusType('error');
        }
    };

    const handleProductSelect = (e) => {
        const userID = e.target.value;
        console.log(formData.UserName)
        const selectedUser = userData.find(p => p._id === userID);
        if (selectedUser) {
            setFormData(prev => ({
                ...prev,
                UserName: selectedUser.UserName
            }));
        }

    };

    const fetchOrders = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/admin/api/order/all-order');
            if (response.data && response.data.order) {
                setOrders(response.data.order);
            } else {
                setOrders([]);
                setStatusMessage("No orders found");
                setStatusType("info");
            }
        } catch (error) {
            setStatusMessage("Failed to fetch orders.");
            setStatusType("error");
            console.error('Error fetching orders:', error);
        }
    }, []);

    const fetchTotalOrders = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/admin/api/order/total-orders');
            if (response.data.status === "success") {
                setTotalOrders(response.data.total || 0);
            }
        } catch (error) {
            console.error('Error fetching total orders:', error);
            setTotalOrders(0);
        }
    }, []);

    useEffect(() => {
        if (statusMessage && statusType) {
            const timer = setTimeout(() => {
                setStatusMessage("");
                setStatusType("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [statusMessage, statusType]);

    useEffect(() => {
        fetchUsers();
    }, [])

    useEffect(() => {
        fetchOrders();
        fetchTotalOrders();

    }, [fetchOrders, fetchTotalOrders]);

    const validateForm = () => {
        let newErrors = {};
        if (!formData.ProductID) newErrors.ProductID = "Product ID is required";
        if (!formData.Quantity) newErrors.Quantity = "Quantity is required";
        if (!formData.UserName) newErrors.UserName = "User Name is required";
        if (!formData.DeliveryAddress) newErrors.DeliveryAddress = "Delivery Address is required";
        if (!formData.OrderDateTime) newErrors.OrderDateTime = "Order Date & Time is required";
        if (!formData.TotalAmount) newErrors.TotalAmount = "Total Amount is required";
        if (!formData.OfferName) newErrors.OfferName = "Offer Name is required";
        if (!formData.DiscountAmount) newErrors.DiscountAmount = "Discount Amount is required";
        if (!formData.ActualAmount) newErrors.ActualAmount = "Actual Amount is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            if (editingOrderId) {
                const response = await axios.put(`http://localhost:5000/admin/api/order/update-order/${editingOrderId}`, formData);
                setStatusMessage(response.data.message || "Order updated successfully");
                setStatusType(response.data.status || "success");
            } else {
                const response = await axios.post('http://localhost:5000/admin/api/order/add-order', formData);
                setStatusMessage(response.data.message || "Order added successfully");
                setStatusType(response.data.status || "success");
            }

            setFormData({
                ProductID: '',
                Quantity: '',
                UserName: '',
                DeliveryAddress: '',
                OrderDateTime: '',
                TotalAmount: '',
                OfferName: '',
                DiscountAmount: '',
                ActualAmount: ''
            });
            setErrors({});
            setEditingOrderId(null);
            fetchOrders();
            fetchTotalOrders();
            setSearchTerm("");
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "An error occurred";
            setStatusMessage(errorMessage);
            setStatusType("error");
        }
    };

    const handleEdit = (id) => {
        const orderToEdit = orders.find((order) => order._id === id);
        if (orderToEdit) {
            setEditingOrderId(id);
            setFormData({
                ...orderToEdit
            });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this order?")) {
            try {
                const response = await axios.delete(`http://localhost:5000/admin/api/order/delete-order/${id}`);
                setStatusMessage(response.data.message || "Order deleted successfully");
                setStatusType(response.data.status || "success");
                fetchOrders();
                fetchTotalOrders();
            } catch (error) {
                setStatusMessage("Error deleting order.");
                setStatusType("error");
                console.error('Error deleting order:', error);
            }
        }
    };

    const viewOrder = (row) => {
        setSelectedRow(row);
    };

    const handleClose = () => {
        setSelectedRow(null);
    };

    const columns = [
        {
            name: "Actions",
            cell: (row) => (
                <div className="action-buttons">
                    <button
                        onClick={() => handleEdit(row._id)}
                        className="edit-btn"
                    >
                        <i className="fas fa-edit"></i>
                    </button>
                    <button
                        onClick={() => handleDelete(row._id)}
                        className="delete-btn"
                    >
                        <i className="fas fa-trash-alt"></i>
                    </button>
                    <button
                        onClick={() => viewOrder(row)}
                        className="view-btn"
                    >
                        <i className="fas fa-eye"></i>
                    </button>
                </div>
            ),
        },
        {
            name: "Product ID",
            selector: (row) => row.ProductID,
            sortable: true,
        },
        {
            name: "User Name",
            selector: (row) => row.UserName,
            sortable: true,
        },
        {
            name: "Delivery Address",
            selector: (row) => row.DeliveryAddress,
        },
        {
            name: "Order Date",
            selector: (row) => row.OrderDateTime,
            sortable: true,
        },
        {
            name: "Total Amount",
            selector: (row) => `₹${row.TotalAmount}`,
            sortable: true,
        },
        {
            name: "Quantity",
            selector: (row) => row.Quantity,
            sortable: true,
        },
        {
            name: "Offer",
            selector: (row) => row.OfferName,
            sortable: true,
        },
        {
            name: "Discount",
            selector: (row) => `₹${row.DiscountAmount}`,
            sortable: true,
        },
        {
            name: "Actual Amount",
            selector: (row) => `₹${row.ActualAmount}`,
            sortable: true,
        },
    ];

    return (
        <div className="order-container">
            <div className="detail">
                Total Orders: {orders.length} || Total Amount: ₹{totalOrders}
            </div>

            {statusMessage && (
                <div className={`status-message ${statusType === "success" ? "success" : "error"}`}>
                    {statusMessage}
                </div>
            )}

            <h1>{editingOrderId ? "Edit Order" : "Add New Order"}</h1>
            <ViewDetails data={selectedRow} onClose={handleClose} />

            <form onSubmit={handleSubmit} className="order-form">
                <div className="form-group">
                    <input
                        type="text"
                        name="ProductID"
                        value={formData.ProductID}
                        onChange={handleChange}
                        placeholder="Product ID"
                    />
                    {errors.ProductID && <span className="error">{errors.ProductID}</span>}
                </div>

                <div className="form-group">
                    <input
                        type="number"
                        name="Quantity"
                        value={formData.Quantity}
                        onChange={handleChange}
                        placeholder="Quantity"
                    />
                    {errors.Quantity && <span className="error">{errors.Quantity}</span>}
                </div>

                <div className="form-group">
                    <input
                        type="text"
                        name="UserName"
                        value={formData.UserName}
                        onChange={handleChange}
                        placeholder="User Name"
                    />
                    {errors.UserName && <span className="error">{errors.UserName}</span>}
                </div>

                {/* <div className="form-group">
                    <select
                        name="UserName"
                        value={formData.UserName}
                        onChange={handleProductSelect}
                        className="user-select"
                    >
                        <option value="" disabled>Select a User</option>
                        {Array.isArray(userData) && userData.length > 0 ? (
                            userData.map(user => (
                                <option key={user._id} value={user.UserName}>
                                    {user.UserName}
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>No users available</option>
                        )}
                    </select>
                    {errors.UserName && <span className="error">{errors.UserName}</span>}
                </div> */}


                <div className="form-group">
                    <input
                        type="text"
                        name="DeliveryAddress"
                        value={formData.DeliveryAddress}
                        onChange={handleChange}
                        placeholder="Delivery Address"
                    />
                    {errors.DeliveryAddress && <span className="error">{errors.DeliveryAddress}</span>}
                </div>

                <div className="form-group">
                    <input
                        type="datetime-local"
                        name="OrderDateTime"
                        value={formData.OrderDateTime}
                        onChange={handleChange}
                        placeholder="Order Date & Time"
                    />
                    {errors.OrderDateTime && <span className="error">{errors.OrderDateTime}</span>}
                </div>

                <div className="form-group">
                    <input
                        type="number"
                        name="TotalAmount"
                        value={formData.TotalAmount}
                        onChange={handleChange}
                        placeholder="Total Amount"
                    />
                    {errors.TotalAmount && <span className="error">{errors.TotalAmount}</span>}
                </div>

                <div className="form-group">
                    <input
                        type="text"
                        name="OfferName"
                        value={formData.OfferName}
                        onChange={handleChange}
                        placeholder="Offer Name"
                    />
                    {errors.OfferName && <span className="error">{errors.OfferName}</span>}
                </div>

                <div className="form-group">
                    <input
                        type="number"
                        name="DiscountAmount"
                        value={formData.DiscountAmount}
                        onChange={handleChange}
                        placeholder="Discount Amount"
                    />
                    {errors.DiscountAmount && <span className="error">{errors.DiscountAmount}</span>}
                </div>

                <div className="form-group">
                    <input
                        type="number"
                        name="ActualAmount"
                        value={formData.ActualAmount}
                        onChange={handleChange}
                        placeholder="Actual Amount"
                    />
                    {errors.ActualAmount && <span className="error">{errors.ActualAmount}</span>}
                </div>

                <button type="submit" className="submit-btn">
                    {editingOrderId ? "Update Order" : "Add Order"}
                </button>
            </form>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="order-table">
                <h3>Order History</h3>
                <ReusableDataTable
                    title="Order List"
                    columns={columns}
                    data={orders.filter((order) => {
                        const productId = order?.ProductID?.toLowerCase() || '';
                        const userName = order?.UserName?.toLowerCase() || '';
                        const deliveryAddress = order?.DeliveryAddress?.toLowerCase() || '';
                        const orderDateTime = order?.OrderDateTime?.toLowerCase() || '';
                        const totalAmount = order?.TotalAmount?.toString() || '';
                        const quantity = order?.Quantity?.toString() || '';
                        const offerName = order?.OfferName?.toLowerCase() || '';
                        const discountAmount = order?.DiscountAmount?.toString() || '';
                        const actualAmount = order?.ActualAmount?.toString() || '';

                        return (
                            productId.includes(searchTerm.toLowerCase()) ||
                            userName.includes(searchTerm.toLowerCase()) ||
                            deliveryAddress.includes(searchTerm.toLowerCase()) ||
                            orderDateTime.includes(searchTerm.toLowerCase()) ||
                            totalAmount.includes(searchTerm) ||
                            quantity.includes(searchTerm) ||
                            offerName.includes(searchTerm.toLowerCase()) ||
                            discountAmount.includes(searchTerm) ||
                            actualAmount.includes(searchTerm)
                        );
                    })}
                    searchble={true}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />
            </div>
        </div>
    );
};

export default OrderProducts;
