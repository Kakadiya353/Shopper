import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InventoryManagement.css';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    ProductID: '',
    ProductName: '',
    Category: '',
    Quantity: 0,
    Location: '',
    MinimumStock: 10,
    MaximumStock: 100,
    ReorderPoint: 20,
    Notes: '',
    Status: 'active'
  });
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [editingInventoryId, setEditingInventoryId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetchInventory();
    fetchProducts();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/admin/api/inventory/all-inventory');
      setInventory(response.data);
    } catch (error) {
      setStatusMessage('Error fetching inventory');
      setStatusType('error');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/admin/api/products/all-products');
      if (response.data && Array.isArray(response.data.product)) {
        setProducts(response.data.product);
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        console.error('Unexpected API response structure:', response.data);
        setProducts([]);
        setStatusMessage('Error: Unexpected data format from products API');
        setStatusType('error');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setStatusMessage('Error fetching products');
      setStatusType('error');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.ProductID) newErrors.ProductID = 'Product is required';
    if (!formData.ProductName) newErrors.ProductName = 'Product name is required';
    if (!formData.Category) newErrors.Category = 'Category is required';
    if (formData.Quantity < 0) newErrors.Quantity = 'Quantity cannot be negative';
    if (!formData.Location) newErrors.Location = 'Location is required';
    if (formData.MinimumStock < 0) newErrors.MinimumStock = 'Minimum stock cannot be negative';
    if (formData.MaximumStock <= formData.MinimumStock) {
      newErrors.MaximumStock = 'Maximum stock must be greater than minimum stock';
    }
    if (formData.ReorderPoint < formData.MinimumStock || formData.ReorderPoint > formData.MaximumStock) {
      newErrors.ReorderPoint = 'Reorder point must be between minimum and maximum stock';
    }

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

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    const selectedProduct = products.find(p => p._id === productId);
    if (selectedProduct) {
      setFormData(prev => ({
        ...prev,
        ProductID: productId,
        ProductName: selectedProduct.Name,
        Category: selectedProduct.Category
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingInventoryId) {
        await axios.put(`http://localhost:5000/admin/api/inventory/update-inventory/${editingInventoryId}`, formData);
        setStatusMessage('Inventory updated successfully');
      } else {
        await axios.post('http://localhost:5000/admin/api/inventory/add-inventory', formData);
        setStatusMessage('Inventory added successfully');
      }
      setStatusType('success');
      resetForm();
      fetchInventory();
    } catch (error) {
      setStatusMessage('Error saving inventory');
      setStatusType('error');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      ProductID: item.ProductID,
      ProductName: item.ProductName,
      Category: item.Category,
      Quantity: item.Quantity,
      Location: item.Location,
      MinimumStock: item.MinimumStock,
      MaximumStock: item.MaximumStock,
      ReorderPoint: item.ReorderPoint,
      Notes: item.Notes,
      Status: item.Status
    });
    setEditingInventoryId(item._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await axios.delete(`http://localhost:5000/admin/api/inventory/delete-inventory/${id}`);
        setStatusMessage('Inventory deleted successfully');
        setStatusType('success');
        fetchInventory();
      } catch (error) {
        setStatusMessage('Error deleting inventory');
        setStatusType('error');
      }
    }
  };

  const handleView = (item) => {
    setSelectedRow(item);
    setShowViewModal(true);
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(`http://localhost:5000/admin/api/inventory/toggle-status/${id}`);
      setStatusMessage(`Inventory status updated to ${currentStatus === 'active' ? 'inactive' : 'active'}`);
      setStatusType('success');
      fetchInventory();
    } catch (error) {
      setStatusMessage('Error updating status');
      setStatusType('error');
    }
  };

  const updateStock = async (id, operation) => {
    try {
      await axios.put(`http://localhost:5000/admin/api/inventory/update-stock/${id}`, {
        quantity: 1,
        operation: operation
      });
      setStatusMessage(`Stock ${operation === 'add' ? 'increased' : 'decreased'} successfully`);
      setStatusType('success');
      fetchInventory();
    } catch (error) {
      setStatusMessage('Error updating stock');
      setStatusType('error');
    }
  };

  const resetForm = () => {
    setFormData({
      ProductID: '',
      ProductName: '',
      Category: '',
      Quantity: 0,
      Location: '',
      MinimumStock: 10,
      MaximumStock: 100,
      ReorderPoint: 20,
      Notes: '',
      Status: 'active'
    });
    setEditingInventoryId(null);
    setErrors({});
  };

  const filteredInventory = inventory.filter(item =>
    item.ProductName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.Category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.Location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="inventory-container">
      <div className="detail">
        Inventory Management
        <span className="separator">|</span>
        {editingInventoryId ? 'Edit Inventory' : 'Add New Inventory'}
      </div>

      {statusMessage && (
        <div className={`status-message ${statusType}`}>
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="inventory-form">
        <div className="form-group">
          <select
            name="ProductID"
            value={formData.ProductID}
            onChange={handleProductSelect}
            className="product-select"
          >
            <option value="">Select a Product</option>
            {Array.isArray(products) && products.length > 0 ? (
              products.map(product => (
                <option key={product._id} value={product._id}>
                  {product.Name}
                </option>
              ))
            ) : (
              <option value="" disabled>No products available</option>
            )}
          </select>
          {errors.ProductID && <span className="error">{errors.ProductID}</span>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="ProductName"
            value={formData.ProductName}
            onChange={handleChange}
            placeholder="Product Name"
            readOnly
          />
          {errors.ProductName && <span className="error">{errors.ProductName}</span>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="Category"
            value={formData.Category}
            onChange={handleChange}
            placeholder="Category"
            readOnly
          />
          {errors.Category && <span className="error">{errors.Category}</span>}
        </div>

        <div className="form-group">
          <input
            type="number"
            name="Quantity"
            value={formData.Quantity}
            onChange={handleChange}
            placeholder="Quantity"
            min="0"
          />
          {errors.Quantity && <span className="error">{errors.Quantity}</span>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="Location"
            value={formData.Location}
            onChange={handleChange}
            placeholder="Location"
          />
          {errors.Location && <span className="error">{errors.Location}</span>}
        </div>

        <div className="form-group">
          <input
            type="number"
            name="MinimumStock"
            value={formData.MinimumStock}
            onChange={handleChange}
            placeholder="Minimum Stock"
            min="0"
          />
          {errors.MinimumStock && <span className="error">{errors.MinimumStock}</span>}
        </div>

        <div className="form-group">
          <input
            type="number"
            name="MaximumStock"
            value={formData.MaximumStock}
            onChange={handleChange}
            placeholder="Maximum Stock"
            min="0"
          />
          {errors.MaximumStock && <span className="error">{errors.MaximumStock}</span>}
        </div>

        <div className="form-group">
          <input
            type="number"
            name="ReorderPoint"
            value={formData.ReorderPoint}
            onChange={handleChange}
            placeholder="Reorder Point"
            min="0"
          />
          {errors.ReorderPoint && <span className="error">{errors.ReorderPoint}</span>}
        </div>

        <div className="form-group">
          <textarea
            name="Notes"
            value={formData.Notes}
            onChange={handleChange}
            placeholder="Notes"
          />
        </div>

        <button type="submit" className="submit-btn">
          {editingInventoryId ? 'Update Inventory' : 'Add Inventory'}
        </button>
      </form>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="inventory-table">
        <h3>Inventory List</h3>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => (
              <tr key={item._id}>
                <td>{item.ProductName}</td>
                <td>{item.Category}</td>
                <td>
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn decrease"
                      onClick={() => updateStock(item._id, 'subtract')}
                      disabled={item.Quantity <= 0}
                    >
                      -
                    </button>
                    <span>{item.Quantity}</span>
                    <button
                      className="quantity-btn increase"
                      onClick={() => updateStock(item._id, 'add')}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td>{item.Location}</td>
                <td>
                  <span className={`status-badge ${item.Status}`}>
                    {item.Status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                    <button
                      className="view-btn"
                      onClick={() => handleView(item)}
                    >
                      View
                    </button>
                    <button
                      className={`status-btn ${item.Status}`}
                      onClick={() => toggleStatus(item._id, item.Status)}
                    >
                      {item.Status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showViewModal && selectedRow && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Inventory Details</h3>
            <div className="modal-content">
              <p><strong>Product Name:</strong> {selectedRow.ProductName}</p>
              <p><strong>Category:</strong> {selectedRow.Category}</p>
              <p><strong>Quantity:</strong> {selectedRow.Quantity}</p>
              <p><strong>Location:</strong> {selectedRow.Location}</p>
              <p><strong>Minimum Stock:</strong> {selectedRow.MinimumStock}</p>
              <p><strong>Maximum Stock:</strong> {selectedRow.MaximumStock}</p>
              <p><strong>Reorder Point:</strong> {selectedRow.ReorderPoint}</p>
              <p><strong>Status:</strong> {selectedRow.Status}</p>
              <p><strong>Notes:</strong> {selectedRow.Notes}</p>
            </div>
            <button className="close-btn" onClick={() => setShowViewModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement; 