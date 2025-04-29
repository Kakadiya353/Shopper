import { useEffect, useState, useCallback } from 'react';
import './ManageUsers.css';
import axios from 'axios'
import ViewDetails from '../ViewDetails/ViewDetails';
import "../../assets/details.css";
import ReusableDataTable from '../ReusableDataTable ';

const ManageUser = () => {
    const [errors, setErrors] = useState({});
    const [statusMessage, setStatusMessage] = useState("");
    const [statusType, setStatusType] = useState("");
    const [selectedRow, setSelectedRow] = useState(null);
    const [editingUserId, setEditingUserId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        UserName: "",
        Email: "",
        Password: "",
        Role: "user",
        Mobile: "",
        Address: "",
        ImageURI: ""
    });

    const fetchUsers = useCallback(async () => {
        try {
            const response = await axios.get("http://localhost:5000/admin/api/users/all-user");
            setUsers(response.data.user || []);
        } catch (error) {
            setStatusMessage("Failed to fetch users.");
            setStatusType("error");
            console.error('Error fetching users:', error);
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
    }, [fetchUsers]);

    const validateForm = () => {
        let newErrors = {};
        if (!formData.UserName) newErrors.UserName = "User Name is required";
        if (!formData.Email) newErrors.Email = "Email is required";
        if (!formData.Password && !editingUserId) newErrors.Password = "Password is required";
        if (!formData.Mobile) newErrors.Mobile = "Mobile number is required";
        if (!formData.Address) newErrors.Address = "Address is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === "file") {
            const file = files[0];
            if (file && file.size <= 2000000) {
                setFormData(prev => ({
                    ...prev,
                    ImageURI: file
                }));
                const imageUrl = URL.createObjectURL(file);
                setImagePreview(imageUrl);
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
        formDataToSend.append("UserName", formData.UserName);
        formDataToSend.append("Email", formData.Email);
        formDataToSend.append("Password", formData.Password);
        formDataToSend.append("Role", formData.Role);
        formDataToSend.append("Mobile", formData.Mobile);
        formDataToSend.append("Address", formData.Address);
        formDataToSend.append("ImageURI", formData.ImageURI);

        try {
            if (editingUserId) {
                const response = await axios.put(
                    `http://localhost:5000/admin/api/users/update-user/${editingUserId}`,
                    formDataToSend,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                setStatusMessage(response.data.message || "User updated successfully");
                setStatusType(response.data.status || "success");
            } else {
                const response = await axios.post(
                    "http://localhost:5000/admin/api/users/add-user",
                    formDataToSend,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                setStatusMessage(response.data.message || "User added successfully");
                setStatusType(response.data.status || "success");
            }

            setFormData({
                UserName: "",
                Email: "",
                Password: "",
                Role: "user",
                Mobile: "",
                Address: "",
                ImageURI: ""
            });
            setErrors({});
            setEditingUserId(null);
            setImagePreview(null);
            fetchUsers();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "An error occurred";
            setStatusMessage(errorMessage);
            setStatusType("error");
        }
    };

    const handleEdit = (id, row) => {
        const userToEdit = users.find(user => user._id === id);
        if (userToEdit) {
            setEditingUserId(id);
            setFormData(userToEdit);
            setImagePreview(`http://localhost:5000/public${row.ImageURI}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await axios.delete(`http://localhost:5000/admin/api/users/delete-user/${id}`);
                setStatusMessage("User deleted successfully");
                setStatusType("success");
                fetchUsers();
            } catch (error) {
                setStatusMessage("Error deleting user.");
                setStatusType("error");
                console.error('Error deleting user:', error);
            }
        }
    };

    const viewUser = (row) => {
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
                        onClick={() => handleEdit(row._id, row)}
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
                        onClick={() => viewUser(row)}
                        className="view-btn"
                    >
                        <i className="fas fa-eye"></i>
                    </button>
                </div>
            ),
        },
        {
            name: "Profile Image",
            selector: (row) => (
                <img
                    src={`http://localhost:5000/public${row.ImageURI}`}
                    alt={row.UserName}
                    className="smaller-image"
                />
            ),
        },
        {
            name: "User Name",
            selector: (row) => row.UserName,
            sortable: true,
        },
        {
            name: "Email",
            selector: (row) => row.Email,
            sortable: true,
        },
        {
            name: "Mobile",
            selector: (row) => row.Mobile,
        },
        {
            name: "Address",
            selector: (row) => row.Address,
        },
        {
            name: "Role",
            selector: (row) => row.Role,
            sortable: true,
        },
    ];

    return (
        <div className="cart-container">

            <div className="detail">
                Total &nbsp; : &nbsp; {users.length}&nbsp;&nbsp;&nbsp; || &nbsp;&nbsp;&nbsp;
                Total Users &nbsp; : &nbsp; {users.filter(user => user.Role === "user").length} &nbsp;&nbsp;&nbsp; ||&nbsp;&nbsp;&nbsp;
                Total Admins &nbsp; : &nbsp; {users.filter(user => user.Role === "admin").length}
            </div>

            {statusMessage && (
                <div className={`status-message ${statusType === "success" ? "success" : "error"}`}>
                    {statusMessage}
                </div>
            )}

            <h1>{editingUserId ? "Edit User" : "Add New User"}</h1>
            <ViewDetails data={selectedRow} onClose={handleClose} />

            <form onSubmit={handleSubmit} className="cart-form">
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

                <div className="form-group">
                    <input
                        type="email"
                        name="Email"
                        value={formData.Email}
                        onChange={handleChange}
                        placeholder="Email"
                        readOnly={editingUserId}
                    />
                    {errors.Email && <span className="error">{errors.Email}</span>}
                </div>

                {!editingUserId && (
                    <div className="form-group">
                        <input
                            type="password"
                            name="Password"
                            value={formData.Password}
                            onChange={handleChange}
                            placeholder="Password"
                        />
                        {errors.Password && <span className="error">{errors.Password}</span>}
                    </div>
                )}

                <div className="form-group">
                    <select
                        name="Role"
                        value={formData.Role}
                        onChange={handleChange}
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div className="form-group">
                    <input
                        type="text"
                        name="Mobile"
                        value={formData.Mobile}
                        onChange={handleChange}
                        placeholder="Mobile Number"
                    />
                    {errors.Mobile && <span className="error">{errors.Mobile}</span>}
                </div>

                <div className="form-group">
                    <input
                        type="text"
                        name="Address"
                        value={formData.Address}
                        onChange={handleChange}
                        placeholder="Address"
                    />
                    {errors.Address && <span className="error">{errors.Address}</span>}
                </div>

                <div className="form-group">
                    <input
                        type="file"
                        name="ImageURI"
                        onChange={handleChange}
                        accept="image/*"
                    />
                    {imagePreview && (
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="image-preview"
                        />
                    )}
                </div>

                <button type="submit" className="submit-btn">
                    {editingUserId ? "Update User" : "Add User"}
                </button>
            </form>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="cart-table">
                <h3>User List</h3>
                <ReusableDataTable
                    title="Users"
                    columns={columns}
                    data={users.filter((user) => {
                        const name = user?.UserName?.toLowerCase() || '';
                        const email = user?.Email?.toLowerCase() || '';
                        const mobile = user?.Mobile?.toLowerCase() || '';
                        const address = user?.Address?.toLowerCase() || '';
                        const role = user?.Role?.toLowerCase() || '';

                        return (
                            name.includes(searchTerm.toLowerCase()) ||
                            email.includes(searchTerm.toLowerCase()) ||
                            mobile.includes(searchTerm.toLowerCase()) ||
                            address.includes(searchTerm.toLowerCase()) ||
                            role.includes(searchTerm.toLowerCase())
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

export default ManageUser;
