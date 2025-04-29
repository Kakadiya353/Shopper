import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CSS/OrderHistory.css";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;
  
    axios.get(`http://localhost:5000/api/orders?email=${userEmail}`)
      .then((response) => setOrders(response.data))
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);
  

  return (
    <div className="order-history-container">
      <h2 className="order-history-title">Order History</h2>
      <div className="order-history-table-container">
        <table className="order-history-table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Quantity</th>
              <th>User Name</th>
              <th>Delivery Address</th>
              <th>Order Date & Time</th>
              <th>Total Amount</th>
              <th>Offer Name</th>
              <th>Discount Amount</th>
              <th>Actual Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="9">No orders found.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.ProductID}</td>
                  <td>{order.Quantity}</td>
                  <td>{order.UserName}</td>
                  <td>{order.DeliveryAddress}</td>
                  <td>{new Date(order.OrderDateTime).toLocaleString()}</td>
                  <td>₹{order.TotalAmount}</td>
                  <td>{order.OfferName || "-"}</td>
                  <td>₹{order.DiscountAmount}</td>
                  <td>₹{order.ActualAmount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderHistory;
