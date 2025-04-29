const express = require('express');
const router = express.Router();
const Inventory = require('../models/inventory.model');
const Product = require('../models/product.model');

// Get all inventory items
router.get('/all-inventory', async (req, res) => {
    try {
        const inventory = await Inventory.find()
            .populate('ProductID', 'Name Price Category ImageURI')
            .sort({ LastUpdated: -1 });
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get inventory by ID
router.get('/:id', async (req, res) => {
    try {
        const inventory = await Inventory.findById(req.params.id)
            .populate('ProductID', 'Name Price Category ImageURI');
        if (!inventory) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new inventory item
router.post('/add-inventory', async (req, res) => {
    try {
        const { ProductID, ProductName, Category, Quantity, Location, MinimumStock, MaximumStock, ReorderPoint, Notes } = req.body;

        // Check if product exists
        const product = await Product.findById(ProductID);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const newInventory = new Inventory({
            ProductID,
            ProductName,
            Category,
            Quantity,
            Location,
            MinimumStock,
            MaximumStock,
            ReorderPoint,
            Notes,
            Status: 'active'
        });

        const savedInventory = await newInventory.save();
        res.status(201).json(savedInventory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update inventory item
router.put('/update-inventory/:id', async (req, res) => {
    try {
        const { Quantity, Location, Status, MinimumStock, MaximumStock, ReorderPoint, Notes } = req.body;
        
        const updatedInventory = await Inventory.findByIdAndUpdate(
            req.params.id,
            {
                Quantity,
                Location,
                Status,
                MinimumStock,
                MaximumStock,
                ReorderPoint,
                Notes,
                LastUpdated: Date.now()
            },
            { new: true }
        );

        if (!updatedInventory) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        res.json(updatedInventory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete inventory item
router.delete('/delete-inventory/:id', async (req, res) => {
    try {
        const deletedInventory = await Inventory.findByIdAndDelete(req.params.id);
        if (!deletedInventory) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }
        res.json({ message: 'Inventory item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get low stock items
router.get('/low-stock', async (req, res) => {
    try {
        const lowStockItems = await Inventory.find({
            Quantity: { $lte: '$ReorderPoint' },
            Status: 'active'
        }).populate('ProductID', 'Name Price Category ImageURI');
        
        res.json(lowStockItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update stock quantity
router.put('/update-stock/:id', async (req, res) => {
    try {
        const { quantity, operation } = req.body; // operation: 'add' or 'subtract'
        
        const inventory = await Inventory.findById(req.params.id);
        if (!inventory) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        if (operation === 'add') {
            inventory.Quantity += quantity;
        } else if (operation === 'subtract') {
            if (inventory.Quantity < quantity) {
                return res.status(400).json({ message: 'Insufficient stock' });
            }
            inventory.Quantity -= quantity;
        } else {
            return res.status(400).json({ message: 'Invalid operation' });
        }

        inventory.LastUpdated = Date.now();
        const updatedInventory = await inventory.save();
        
        res.json(updatedInventory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get inventory by category
router.get('/category/:category', async (req, res) => {
    try {
        const inventory = await Inventory.find({ Category: req.params.category })
            .populate('ProductID', 'Name Price Category ImageURI');
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get inventory by location
router.get('/location/:location', async (req, res) => {
    try {
        const inventory = await Inventory.find({ Location: req.params.location })
            .populate('ProductID', 'Name Price Category ImageURI');
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Toggle inventory status
router.put('/toggle-status/:id', async (req, res) => {
    try {
        const inventory = await Inventory.findById(req.params.id);
        if (!inventory) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        inventory.Status = inventory.Status === 'active' ? 'inactive' : 'active';
        inventory.LastUpdated = Date.now();
        
        const updatedInventory = await inventory.save();
        res.json(updatedInventory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router; 