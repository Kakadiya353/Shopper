const express = require('express')
const router = express.Router()
const UserModel = require('../models/user.model')
const OfferModel = require('../models/offer.model')
const ProductModel = require('../models/product.model')
const OrderModel = require('../models/order.model')

router.get('/user-count', async (req, res) => {
    try {
        const totalDocs = await UserModel.countDocuments()
        const totalUserDocs = await UserModel.countDocuments({Role:'user'})
        const totalAdminDocs = await UserModel.countDocuments({ Role: 'admin' })
        res.status(200).json({totalDocs, totalUserDocs, totalAdminDocs})
    } catch (e) {
        console.error('User-Count Error:', e)
        res.status(500).json({ error: 'Failed to fetch user counts' })
    }
})

router.get('/offers-details', async (req, res) => {
    try {
        const totalOffers = await OfferModel.countDocuments()
        const activeOffers = await OfferModel.countDocuments({ Status: 'active' })
        const inactiveOffers = await OfferModel.countDocuments({ Status: 'inactive' })
        res.status(200).json({totalOffers, activeOffers, inactiveOffers})
    } catch (e) {
        console.error('Offers-Details Error:', e)
        res.status(500).json({ error: 'Failed to fetch offer details' })
    }
})

router.get('/product-category', async (req, res) => {
    try {
        const totalProducts = await ProductModel.countDocuments()
        const womenCategory = await ProductModel.countDocuments({ Category: 'women' })
        const menCategory = await ProductModel.countDocuments({ Category: 'men' })
        const kidsCategory = await ProductModel.countDocuments({ Category: 'kids' })
        res.status(200).json({totalProducts, womenCategory, menCategory, kidsCategory})
    } catch (e) {
        console.error('Product-Category Error:', e)
        res.status(500).json({ error: 'Failed to fetch product categories' })
    }
})

router.get('/total-sales', async (req, res) => {
    try {
        const totalSales = await OrderModel.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])
        res.status(200).json({ totalSales: totalSales[0]?.total || 0 })
    } catch (e) {
        console.error('Total-Sales Error:', e)
        res.status(500).json({ error: 'Failed to fetch total sales' })
    }
})

module.exports = router  