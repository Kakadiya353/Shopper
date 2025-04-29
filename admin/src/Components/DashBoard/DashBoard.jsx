import React, { useEffect, useState, useCallback } from "react";
import "./Dashboard.css";
import axios from 'axios'

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userCount, setUserCount] = useState({
    totalDocs: 0,
    totalUserDocs: 0,
    totalAdminDocs: 0,
  })

  const [offerStatus, setOfferStatus] = useState({
    totalOffers: 0,
    activeOffers: 0,
    inactiveOffers: 0,
  })

  const [category, setCategories] = useState({
    totalProducts: 0,
    womenCategory: 0,
    menCategory: 0,
    kidsCategory: 0,
  });

  const [sales, setSales] = useState({
    totalSales: 0,
  });

  const fetchUserCount = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/admin/api/dash-board/user-count');
      setUserCount({
        totalDocs: res.data.totalDocs || 0,
        totalUserDocs: res.data.totalUserDocs || 0,
        totalAdminDocs: res.data.totalAdminDocs || 0,
      });
    } catch (error) {
      console.error("Error fetching user counts:", error);
      setError("Failed to fetch user data");
    }
  }, []);

  const fetchOfferStatus = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/admin/api/dash-board/offers-details');
      setOfferStatus({
        totalOffers: res.data.totalOffers || 0,
        activeOffers: res.data.activeOffers || 0,
        inactiveOffers: res.data.inactiveOffers || 0,
      });
    } catch (error) {
      console.error("Error fetching offer status:", error);
      setError("Failed to fetch offer data");
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      console.log("Fetching product categories...");
      const res = await axios.get("http://localhost:5000/admin/api/dash-board/product-category");
      console.log("Product categories response:", res.data);
      setCategories({
        totalProducts: res.data.totalProducts || 0,
        womenCategory: res.data.womenCategory || 0,
        menCategory: res.data.menCategory || 0,
        kidsCategory: res.data.kidsCategory || 0,
      });
    } catch (error) {
      console.error("Error fetching product status:", error);
      console.error("Error details:", error.response?.data || error.message);
      setError("Failed to fetch product data");
    }
  }, []);

  const fetchSales = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/api/dash-board/total-sales");
      setSales({
        totalSales: res.data.totalSales || 0,
      });
    } catch (error) {
      console.error("Error fetching sales:", error);
      setError("Failed to fetch sales data");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchUserCount(),
          fetchOfferStatus(),
          fetchCategories(),
          fetchSales()
        ]);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchUserCount, fetchOfferStatus, fetchCategories, fetchSales]);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-message">{error}</div>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h2>Admin Dashboard</h2>
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Users Overview</h3>
          <p>Total Users: {userCount.totalDocs}</p>
          <p>Regular Users: {userCount.totalUserDocs}</p>
          <p>Admin Users: {userCount.totalAdminDocs}</p>
        </div>

        <div className="dashboard-card">
          <h3>Sales Overview</h3>
          <p>Total Sales: ${sales.totalSales.toLocaleString()}</p>
          <p>Today's Sales: $0</p>
          <p>Monthly Sales: $0</p>
        </div>

        <div className="dashboard-card">
          <h3>Offers Overview</h3>
          <p>Total Offers: {offerStatus.totalOffers}</p>
          <p>Active Offers: {offerStatus.activeOffers}</p>
          <p>Inactive Offers: {offerStatus.inactiveOffers}</p>
        </div>

        <div className="dashboard-card">
          <h3>Products Overview</h3>
          <p>Total Products: {category.totalProducts}</p>
          <p>Women's Products: {category.womenCategory}</p>
          <p>Men's Products: {category.menCategory}</p>
          <p>Kids' Products: {category.kidsCategory}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
