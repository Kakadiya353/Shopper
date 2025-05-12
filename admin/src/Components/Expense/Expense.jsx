import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Expense.css';
import ViewDetails from '../ViewDetails/ViewDetails';
import "../../assets/details.css";
import ReusableDataTable from '../ReusableDataTable ';

const Expense = () => {
    const [expenses, setExpenses] = useState([]);
    const [statusMessage, setStatusMessage] = useState("");
    const [statusType, setStatusType] = useState("");
    const [selectedRow, setSelectedRow] = useState(null);
    const [editingExpenseId, setEditingExpenseId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [errors, setErrors] = useState({});
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [formData, setFormData] = useState({
        Date: '',
        Title: '',
        Description: '',
        Amount: '',
        PaymentMethod: ''
    });

    const fetchExpenses = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/admin/api/expense/all-expense');
            console.log('API Response:', response.data);
            if (response.data && response.data.expenses) {
                setExpenses(response.data.expenses);
            } else {
                setExpenses([]);
                setStatusMessage("No expenses found");
                setStatusType("info");
            }
        } catch (error) {
            setStatusMessage("Failed to fetch expenses.");
            setStatusType("error");
            console.error('Error fetching expenses:', error);
        }
    }, []);

    const fetchTotalExpenses = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/admin/api/expense/total-expenses');
            if (response.data.status === "success") {
                setTotalExpenses(response.data.total || 0);
            }
        } catch (error) {
            console.error('Error fetching total expenses:', error);
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
        fetchExpenses();
        fetchTotalExpenses();
    }, [fetchExpenses, fetchTotalExpenses]);

    const validateForm = () => {
        let newErrors = {};
        if (!formData.Title) newErrors.Title = "Title is required";
        if (!formData.Amount) newErrors.Amount = "Amount is required";
        if (!formData.PaymentMethod) newErrors.PaymentMethod = "Payment method is required";
        if (!formData.Date) newErrors.Date = "Date is required";

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
            if (editingExpenseId) {
                const response = await axios.put(`http://localhost:5000/admin/api/expense/update-expense/${editingExpenseId}`, formData);
                setStatusMessage(response.data.message || "Expense updated successfully");
                setStatusType(response.data.status || "success");
            } else {
                const response = await axios.post('http://localhost:5000/admin/api/expense/add-expense', formData);
                setStatusMessage(response.data.message || "Expense added successfully");
                setStatusType(response.data.status || "success");
            }

            setFormData({
                Date: '',
                Title: '',
                Description: '',
                Amount: '',
                PaymentMethod: ''
            });
            setErrors({});
            setEditingExpenseId(null);
            fetchExpenses();
            fetchTotalExpenses();
            setSearchTerm("");
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "An error occurred";
            setStatusMessage(errorMessage);
            setStatusType("error");
        }
    };

    const handleEdit = (id) => {
        const expenseToEdit = expenses.find((expense) => expense._id === id);
        if (expenseToEdit) {
            setEditingExpenseId(id);
            // Format the date for the input field (YYYY-MM-DD)
            const formattedDate = new Date(expenseToEdit.Date).toISOString().split('T')[0];
            setFormData({
                ...expenseToEdit,
                Date: formattedDate
            });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this expense?")) {
            try {
                const response = await axios.delete(`http://localhost:5000/admin/api/expense/delete-expense/${id}`);
                setStatusMessage(response.data.message || "Expense deleted successfully");
                setStatusType(response.data.status || "success");
                fetchExpenses();
                fetchTotalExpenses();
            } catch (error) {
                setStatusMessage("Error deleting expense.");
                setStatusType("error");
                console.error('Error deleting expense:', error);
            }
        }
    };

    const viewExpense = (row) => {
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
                        onClick={() => viewExpense(row)}
                        className="view-btn"
                    >
                        <i className="fas fa-eye"></i>
                    </button>
                </div>
            ),
        },
        {
            name: "Date",
            selector: (row) => new Date(row.Date).toLocaleDateString(),
            sortable: true,
        },
        {
            name: "Title",
            selector: (row) => row.Title,
            sortable: true,
        },
        {
            name: "Description",
            selector: (row) => row.Description,
        },
        {
            name: "Amount",
            selector: (row) => `₹${row.Amount}`,
            sortable: true,
        },
        {
            name: "Payment Method",
            selector: (row) => row.PaymentMethod,
            sortable: true,
        },
    ];

    return (
        <div className="expense-container">
            <div className="detail">
                Total Expenses: {expenses.length} || Total Amount: ₹{totalExpenses}
            </div>

            {statusMessage && (
                <div className={`status-message ${statusType === "success" ? "success" : "error"}`}>
                    {statusMessage}
                </div>
            )}

            <h1>{editingExpenseId ? "Edit Expense" : "Add New Expense"}</h1>
            <ViewDetails data={selectedRow} onClose={handleClose} />

            <form onSubmit={handleSubmit} className="expense-form">
                <div className="form-group">
                    <input
                        type="date"
                        name="Date"
                        value={formData.Date}
                        onChange={handleChange}
                        placeholder="Date"
                    />
                    {errors.Date && <span className="error">{errors.Date}</span>}
                </div>

                <div className="form-group">
                    <input
                        type="text"
                        name="Title"
                        value={formData.Title}
                        onChange={handleChange}
                        placeholder="Title"
                    />
                    {errors.Title && <span className="error">{errors.Title}</span>}
                </div>

                <div className="form-group">
                    <textarea
                        name="Description"
                        value={formData.Description}
                        onChange={handleChange}
                        placeholder="Description"
                    />
                </div>

                <div className="form-group">
                    <input
                        type="number"
                        name="Amount"
                        value={formData.Amount}
                        onChange={handleChange}
                        placeholder="Amount"
                    />
                    {errors.Amount && <span className="error">{errors.Amount}</span>}
                </div>

                <div className="form-group">
                    <select
                        name="PaymentMethod"
                        value={formData.PaymentMethod}
                        onChange={handleChange}
                    >
                        <option value="">Select Payment Method</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="bank">Bank</option>
                        <option value="upi">UPI</option>
                    </select>
                    {errors.PaymentMethod && <span className="error">{errors.PaymentMethod}</span>}
                </div>

                <button type="submit" className="submit-btn">
                    {editingExpenseId ? "Update Expense" : "Add Expense"}
                </button>
            </form>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="expense-table">
                <h3>Expense History</h3>
                <ReusableDataTable
                    title="Expense List"
                    columns={columns}
                    data={expenses.filter((expense) => {
                        const title = expense?.Title?.toLowerCase() || '';
                        const description = expense?.Description?.toLowerCase() || '';
                        const amount = expense?.Amount?.toString() || '';
                        const paymentMethod = expense?.PaymentMethod?.toLowerCase() || '';

                        return (
                            title.includes(searchTerm.toLowerCase()) ||
                            description.includes(searchTerm.toLowerCase()) ||
                            amount.includes(searchTerm) ||
                            paymentMethod.includes(searchTerm.toLowerCase())
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

export default Expense; 