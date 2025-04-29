import './AddProduct.css';
import axios from "axios";
import { useEffect, useState, useCallback } from 'react';
import "../../assets/details.css";
import ViewDetails from '../ViewDetails/ViewDetails';
import ReusableDataTable from '../ReusableDataTable ';

const AddProduct = () => {
    const [errors, setErrors] = useState({});
    const [statusMessage, setStatusMessage] = useState("");
    const [statusType, setStatusType] = useState("");
    const [selectedRow, setSelectedRow] = useState(null);
    const [editingProductId, setEditingProductId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        Name: "",
        ImageURI: "",
        Category: "",
        Price: "",
        Old_Price: "",
        Status: ""
    });

    const fetchProducts = useCallback(async () => {
        try {
            const response = await axios.get("http://localhost:5000/admin/api/products/all-products");
            setProducts(response.data.product || []);
        } catch (error) {
            setStatusMessage("Failed to fetch products.");
            setStatusType("error");
            console.error('Error fetching products:', error);
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
        fetchProducts();
    }, [fetchProducts]);

    const validateForm = () => {
        let newErrors = {};
        if (!formData.Name.trim() || formData.Name.length < 3) {
            newErrors.Name = "Product title must be at least 3 characters.";
        }
        if (!formData.Category) {
            newErrors.Category = "Select a category.";
        }
        if (!formData.Price || isNaN(formData.Price) || formData.Price <= 0) {
            newErrors.Price = "Price must be a positive number.";
        }
        if (!formData.Old_Price || isNaN(formData.Old_Price) || formData.Old_Price <= 0) {
            newErrors.Old_Price = "Old price must be a positive number.";
        }
        if (!formData.Status) {
            newErrors.Status = "Select a status.";
        }
        if (!formData.ImageURI) {
            newErrors.ImageURI = "Please upload an image.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, type, value, files } = e.target;
        if (type === 'file') {
            const file = files[0];
            if (file && file.size <= 2000000) {
                setFormData(prev => ({ ...prev, ImageURI: file }));
                setImagePreview(URL.createObjectURL(file));
            } else {
                setFormData(prev => ({ ...prev, ImageURI: "" }));
                setImagePreview(null);
                setStatusMessage("Image upload error: file size should not exceed 2MB.");
                setStatusType("error");
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const formDataToSend = new FormData();
        formDataToSend.append('Name', formData.Name);
        formDataToSend.append('ImageURI', formData.ImageURI);
        formDataToSend.append('Category', formData.Category);
        formDataToSend.append('Price', formData.Price);
        formDataToSend.append('Old_Price', formData.Old_Price);
        formDataToSend.append('Status', formData.Status);

        try {
            if (editingProductId) {
                const response = await axios.put(
                    `http://localhost:5000/admin/api/products/update-product/${editingProductId}`,
                    formDataToSend,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                setStatusMessage(response.data.message || "Product updated successfully");
                setStatusType(response.data.status || "success");
            } else {
                const response = await axios.post(
                    "http://localhost:5000/admin/api/products/add-product",
                    formDataToSend,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                setStatusMessage(response.data.message || "Product added successfully");
                setStatusType(response.data.status || "success");
            }

            setFormData({
                Name: "",
                ImageURI: "",
                Category: "",
                Price: "",
                Old_Price: "",
                Status: ""
            });
            setErrors({});
            setImagePreview(null);
            setSearchTerm("");
            fetchProducts();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "An error occurred";
            setStatusMessage(errorMessage);
            setStatusType("error");
        }
    };

    const handleEdit = (id) => {
        const productToEdit = products.find(product => product._id === id);
        if (productToEdit) {
            setEditingProductId(id);
            setFormData(productToEdit);
            setImagePreview(`http://localhost:5000/public${productToEdit.ImageURI}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await axios.delete(`http://localhost:5000/admin/api/products/delete-product/${id}`);
                setStatusMessage("Product deleted successfully");
                setStatusType("success");
                fetchProducts();
            } catch (error) {
                setStatusMessage("Error deleting product.");
                setStatusType("error");
                console.error('Error deleting product:', error);
            }
        }
    };

    const toggleActive = async (id) => {
        const productToToggle = products.find(p => p._id === id);
        if (!productToToggle) return;

        const newStatus = productToToggle.Status === "active" ? "inactive" : "active";

        try {
            const response = await axios.put(`http://localhost:5000/admin/api/products/update-status/${id}`, {
                Status: newStatus,
            });
            setStatusMessage(response.data.message || "Status updated successfully.");
            setStatusType("success");
            fetchProducts();
        } catch (error) {
            setStatusMessage("Failed to update status.");
            setStatusType("error");
        }
    };

    const viewProduct = (row) => {
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
                        onClick={() => viewProduct(row)}
                        className="view-btn"
                    >
                        <i className="fas fa-eye"></i>
                    </button>
                    <button
                        className={`active-btn ${row.Status === 'active' ? 'active' : 'inactive'}`}
                        onClick={() => toggleActive(row._id)}
                    >
                        <i className="fas fa-check-circle"></i>
                        {row.Status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                </div>
            ),
        },
        {
            name: "Image",
            selector: (row) => (
                <img
                    src={`http://localhost:5000/public${row.ImageURI}`}
                    alt={row.Name}
                    className="smaller-image"
                />
            ),
        },
        {
            name: "Product Name",
            selector: (row) => row.Name,
            sortable: true,
        },
        {
            name: "Category",
            selector: (row) => row.Category,
        },
        {
            name: "Old Price",
            selector: (row) => row.Old_Price,
            sortable: true,
        },
        {
            name: "New Price",
            selector: (row) => row.Price,
            sortable: true,
        },
        {
            name: "Status",
            selector: (row) => row.Status,
        },
    ];

    return (
        <div className="product-container">
            <div className="detail">
                Total Products &nbsp; : &nbsp; {products.length} &nbsp;&nbsp;&nbsp; || &nbsp;&nbsp;&nbsp;
                Active Products &nbsp;: &nbsp; {products.filter(p => p.Status === "active").length} &nbsp;&nbsp;&nbsp; ||&nbsp;&nbsp;&nbsp;
                Inactive Products &nbsp; : &nbsp; {products.filter(p => p.Status === "inactive").length}
            </div>

            {statusMessage && (
                <div className={`status-message ${statusType === "success" ? "success" : "error"}`}>
                    {statusMessage}
                </div>
            )}

            <h1>{editingProductId ? "Edit Product" : "Add New Product"}</h1>
            <ViewDetails data={selectedRow} onClose={handleClose} />

            <form onSubmit={handleSubmit} className="product-form">
                <div className="form-group">
                    <input
                        type="text"
                        name="Name"
                        value={formData.Name}
                        onChange={handleChange}
                        placeholder="Product Name"
                    />
                    {errors.Name && <span className="error">{errors.Name}</span>}
                </div>

                <div className="form-group">
                    <input
                        type="file"
                        name="ImageURI"
                        onChange={handleChange}
                        accept="image/*"
                    />
                    {errors.ImageURI && <span className="error">{errors.ImageURI}</span>}
                    {imagePreview && (
                        <img src={imagePreview} alt="Preview" className="image-preview" />
                    )}
                </div>

                <div className="form-group">
                    <select
                        name="Category"
                        value={formData.Category}
                        onChange={handleChange}
                    >
                        <option value="">Select Category</option>
                        <option value="women">Women</option>
                        <option value="men">Men</option>
                        <option value="kids">Kids</option>
                    </select>
                    {errors.Category && <span className="error">{errors.Category}</span>}
                </div>

                <div className="form-group">
                    <input
                        type="number"
                        name="Price"
                        value={formData.Price}
                        onChange={handleChange}
                        placeholder="New Price"
                    />
                    {errors.Price && <span className="error">{errors.Price}</span>}
                </div>

                <div className="form-group">
                    <input
                        type="number"
                        name="Old_Price"
                        value={formData.Old_Price}
                        onChange={handleChange}
                        placeholder="Old Price"
                    />
                    {errors.Old_Price && <span className="error">{errors.Old_Price}</span>}
                </div>

                <div className="form-group">
                    <select
                        name="Status"
                        value={formData.Status}
                        onChange={handleChange}
                    >
                        <option value="">Select Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    {errors.Status && <span className="error">{errors.Status}</span>}
                </div>

                <button type="submit" className="submit-btn">
                    {editingProductId ? "Update Product" : "Add Product"}
                </button>
            </form>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="product-table">
                <h3>Product List</h3>
                <ReusableDataTable
                    title="Products"
                    columns={columns}
                    data={products.filter((product) => {
                        const name = product?.Name?.toLowerCase() || '';
                        const category = product?.Category?.toLowerCase() || '';
                        const price = product?.Price?.toString() || '';
                        const oldPrice = product?.Old_Price?.toString() || '';

                        return (
                            name.includes(searchTerm.toLowerCase()) ||
                            category.includes(searchTerm.toLowerCase()) ||
                            price.includes(searchTerm) ||
                            oldPrice.includes(searchTerm)
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

export default AddProduct;
