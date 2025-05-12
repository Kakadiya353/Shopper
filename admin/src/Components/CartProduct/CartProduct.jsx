import './CartProduct.css';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import "../../assets/details.css";
import ViewDetails from '../ViewDetails/ViewDetails';
import ReusableDataTable from '../ReusableDataTable ';

const CartProduct = () => {
    const [errors, setErrors] = useState({});
    const [statusMessage, setStatusMessage] = useState("");
    const [statusType, setStatusType] = useState("");
    const [selectedRow, setSelectedRow] = useState(null);
    const [editingCartId, setEditingCartId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [cart, setCart] = useState([]);
    const [formData, setFormData] = useState({
        ProductName: "",
        Category: "",
        Price: "",
        Email: "",
        Quantity: "",
        Total: ""
    });

    const fetchCart = useCallback(async () => {
        try {
            const response = await axios.get("http://localhost:5000/admin/api/cart/all-cart");
            setCart(response.data.cart || []);
        } catch (error) {
            setStatusMessage("Failed to fetch Carts.");
            setStatusType("error");
            console.error('Error fetching carts:', error);
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
        fetchCart();
    }, [fetchCart]);

    const validateForm = () => {
        let newErrors = {};
        if (!formData.ProductName) newErrors.ProductName = "Product Name is required";
        if (!formData.Category) newErrors.Category = "Product Category is required";
        if (!formData.Price) newErrors.Price = "Product Price is required";
        if (!formData.Email) newErrors.Email = "Product Email is required";
        if (!formData.Quantity) newErrors.Quantity = "Product Quantity is required";
        if (!formData.Total) newErrors.Total = "Product Total is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("ProductName", formData.ProductName);
            formDataToSend.append("Category", formData.Category);
            formDataToSend.append("Price", formData.Price);
            formDataToSend.append("Email", formData.Email);
            formDataToSend.append("Quantity", formData.Quantity);
            formDataToSend.append("Total", formData.Total);

            if (editingCartId) {
                const response = await axios.put(
                    `http://localhost:5000/admin/api/cart/update-cart/${editingCartId}`,
                    {
                        ProductName: formData.ProductName,
                        Category: formData.Category,
                        Price: formData.Price,
                        Email: formData.Email,
                        Quantity: formData.Quantity,
                        Total: formData.Total
                    },
                    { headers: { "Content-Type": "application/json" } }
                );
                setStatusMessage(response.data.message || "Cart Details updated successfully");
                setStatusType(response.data.status || "success");
            } else {
                const response = await axios.post(
                    "http://localhost:5000/admin/api/cart/add-cart",
                    formDataToSend,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                setStatusMessage(response.data.message || "Cart Details added successfully");
                setStatusType(response.data.status || "success");
            }

            setFormData({
                ProductName: "",
                Category: "",
                Price: "",
                Email: "",
                Quantity: "",
                Total: ""
            });
            setErrors({});
            setEditingCartId(null);
            fetchCart();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "An error occurred";
            setStatusMessage(errorMessage);
            setStatusType("error");
        }
    };

    const handleEdit = (id) => {
        const cartToEdit = cart.find(cart => cart._id === id);
        if (cartToEdit) {
            setEditingCartId(id);
            setFormData(cartToEdit);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this cart?")) {
            try {
                await axios.delete(`http://localhost:5000/admin/api/cart/delete-cart/${id}`);
                setStatusMessage("Cart deleted successfully");
                setStatusType("success");
                fetchCart();
            } catch (error) {
                setStatusMessage("Error deleting cart.");
                setStatusType("error");
                console.error('Error deleting cart:', error);
            }
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
                </div>
            ),
        },
        {
            name: "Name",
            selector: (row) => row.ProductName,
            sortable: true,
        },
        {
            name: "Category",
            selector: (row) => row.Category,
            sortable: true,
        },
        {
            name: "Price",
            selector: (row) => row.Price,
            sortable: true,
        },
        {
            name: "Email",
            selector: (row) => row.Email,
            sortable: true,
        },
        {
            name: "Quantity",
            selector: (row) => row.Quantity,
            sortable: true,
        },
        {
            name: "Total",
            selector: (row) => row.Total,
            sortable: true,
        },
    ];

    return (
        <div className="cart-container">
            <div className="detail">
                Total Carts &nbsp; : &nbsp; {cart.length}
            </div>

            {statusMessage && (
                <div className={`status-message ${statusType === "success" ? "success" : "error"}`}>
                    {statusMessage}
                </div>
            )}

            <h1>{editingCartId ? "Edit Cart" : "Add New Cart"}</h1>
            <ViewDetails data={selectedRow} onClose={handleClose} />

            <form onSubmit={handleSubmit} className="cart-form">
                <div className="form-group">
                    <input
                        type="text"
                        name="ProductName"
                        value={formData.ProductName}
                        onChange={handleChange}
                        placeholder="Product Name"
                    />
                    {errors.ProductName && <span className="error">{errors.ProductName}</span>}
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
                        placeholder="Price"
                    />
                    {errors.Price && <span className="error">{errors.Price}</span>}
                </div>

                <div className="form-group">
                    <input
                        type="email"
                        name="Email"
                        value={formData.Email}
                        onChange={handleChange}
                        placeholder="Email"
                    />
                    {errors.Email && <span className="error">{errors.Email}</span>}
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
                        type="number"
                        name="Total"
                        value={formData.Total}
                        onChange={handleChange}
                        placeholder="Total"
                    />
                    {errors.Total && <span className="error">{errors.Total}</span>}
                </div>

                <button type="submit" className="submit-btn">
                    {editingCartId ? "Update Cart" : "Add Cart"}
                </button>
            </form>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search carts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="cart-table">
                <h3>Cart List</h3>
                <ReusableDataTable
                    title="Carts"
                    columns={columns}
                    data={cart.filter((item) => {
                        const name = item?.ProductName?.toLowerCase() || '';
                        const category = item?.Category?.toLowerCase() || '';
                        const email = item?.Email?.toLowerCase() || '';
                        const price = item?.Price?.toString() || '';
                        const quantity = item?.Quantity?.toString() || '';
                        const total = item?.Total?.toString() || '';

                        return (
                            name.includes(searchTerm.toLowerCase()) ||
                            category.includes(searchTerm.toLowerCase()) ||
                            email.includes(searchTerm.toLowerCase()) ||
                            price.includes(searchTerm) ||
                            quantity.includes(searchTerm) ||
                            total.includes(searchTerm)
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

export default CartProduct;
