const express = require('express');
const router = express.Router();
const ExpenseModel = require('../models/expense.model');
const multer = require('multer');
const upload = multer();

// Get all expenses
router.get('/all-expense', async (req, res) => {
    try {
        const expenses = await ExpenseModel.find().sort({ Date: -1 });
        res.status(200).json({
            status: "success",
            expenses: expenses
        });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({
            status: "error",
            message: "Error fetching expenses"
        });
    }
});

// Add new expense
router.post('/add-expense', upload.none(), async (req, res) => {
    try {
        const {
            Date,
            Title,
            Description,
            Amount,
            PaymentMethod
        } = req.body;

        if (!Date || !Title || !Amount || !PaymentMethod) {
            return res.status(400).json({
                status: "error",
                message: "All fields are required. Please complete the form."
            });
        }

        const newExpense = new ExpenseModel({
            Date,
            Title,
            Description,
            Amount,
            PaymentMethod
        });

        await newExpense.save();
        res.status(201).json({
            status: "success",
            message: "Expense added successfully",
            expense: newExpense
        });
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({
            status: "error",
            message: "Error adding expense"
        });
    }
});

// Update expense
router.put('/update-expense/:id', upload.none(), async (req, res) => {
    try {
        const {
            Date,
            Title,
            Description,
            Amount,
            PaymentMethod
        } = req.body;

        if (!Date || !Title || !Amount || !PaymentMethod) {
            return res.status(400).json({
                status: "error",
                message: "All fields are required. Please complete the form."
            });
        }

        const updatedExpense = await ExpenseModel.findByIdAndUpdate(
            req.params.id,
            {
                Date,
                Title,
                Description,
                Amount,
                PaymentMethod
            },
            { new: true }
        );

        if (!updatedExpense) {
            return res.status(404).json({
                status: "error",
                message: "Expense not found"
            });
        }

        res.status(200).json({
            status: "success",
            message: "Expense updated successfully",
            expense: updatedExpense
        });
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({
            status: "error",
            message: "Error updating expense"
        });
    }
});

// Delete expense
router.delete('/delete-expense/:id', async (req, res) => {
    try {
        const deletedExpense = await ExpenseModel.findByIdAndDelete(req.params.id);
        
        if (!deletedExpense) {
            return res.status(404).json({
                status: "error",
                message: "Expense not found"
            });
        }

        res.status(200).json({
            status: "success",
            message: "Expense deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({
            status: "error",
            message: "Error deleting expense"
        });
    }
});

// Get total expenses
router.get('/total-expenses', async (req, res) => {
    try {
        const totalExpenses = await ExpenseModel.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$Amount" }
                }
            }
        ]);

        res.status(200).json({
            status: "success",
            total: totalExpenses[0]?.total || 0
        });
    } catch (error) {
        console.error('Error calculating total expenses:', error);
        res.status(500).json({
            status: "error",
            message: "Error calculating total expenses"
        });
    }
});

module.exports = router; 