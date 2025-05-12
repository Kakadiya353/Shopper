import React, { useEffect, useState } from 'react';
import './CartItems.css';
import removeIcon from '../Assets/cart_cross_icon.png';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Checkout from '../Checkout/Checkout';
import OfferItems from '../Offers/OfferItems';

const CartItems = () => {
    const [cartItems, setCartItems] = useState([]);
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
    const token = localStorage.getItem("token");
    const [offers, setOffers] = useState([]);
    const [selectedOffer, setSelectedOffer] = useState(null);

    const fetchCartItems = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/cart', {
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });
            setCartItems(res.data);
        } catch (err) {
            console.error('Fetch cart error:', err);
        }
    };

    const fetchOffers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/cart/offer', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            // const activeOffers = res.data.filter(offer => offer.Status === 'Active');
            setOffers(res.data);
        } catch (err) {
            console.error('Fetch offers error:', err);
        }
    };

    const handleQuantityChange = async (productName, action) => {
        const item = cartItems.find(i => i.ProductName === productName);
        if (!item) return;

        let newQuantity = item.Quantity;
        if (action === 'increase') newQuantity += 1;
        else if (action === 'decrease' && newQuantity > 1) newQuantity -= 1;

        try {
            const res = await axios.post('http://localhost:5000/api/cart/update-quantity', {
                productName: item.ProductName,
                quantity: newQuantity,
                email: userEmail,
            });

            setCartItems(prev =>
                prev.map(i =>
                    i.ProductName === res.data.productName
                        ? { ...i, Quantity: res.data.quantity, Total: res.data.totalPrice }
                        : i
                )
            );
        } catch (err) {
            console.error('Update quantity error:', err);
        }
    };

    const handleRemoveItem = async (productName) => {
        try {
            await axios.delete(`http://localhost:5000/api/cart/${productName}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCartItems(prev => prev.filter(i => i.ProductName !== productName));
        } catch (err) {
            console.error('Remove item error:', err);
        }
    };

    const handleOfferSelect = (offer) => {
        if (selectedOffer?._id === offer._id) {
            // If already selected, cancel the offer
            setSelectedOffer(null);
        } else {
            // Otherwise, select the offer
            setSelectedOffer(offer);
        }
    };


    useEffect(() => {
        fetchCartItems();
        fetchOffers();
    }, );

    return (
        <div className="cartitems">
            {cartItems.length === 0 ? (
                <p>
                    Cart is empty. Continue Shopping <Link to="/" className="shopping-continue">here</Link>
                </p>
            ) : (
                <>
                    <div className="cartitems-format-main">
                        <p>Title</p>
                        <p>Price</p>
                        <p>Quantity</p>
                        <p>Total</p>
                        <p>Remove</p>
                    </div>
                    <hr />
                    {cartItems.map(item => (
                        <div key={item.ProductName}>
                            <div className="cartitems-format cartitems-format-main">
                                <p>{item.ProductName}</p>
                                <p>${item.Price}</p>
                                <div className="cartitems-quantity-controls">
                                    <button onClick={() => handleQuantityChange(item.ProductName, 'decrease')}>-</button>
                                    <button className="cartitems-quantity">{item.Quantity}</button>
                                    <button onClick={() => handleQuantityChange(item.ProductName, 'increase')}>+</button>
                                </div>
                                <p>${item.Total.toFixed(2)}</p>
                                <img
                                    src={removeIcon}
                                    alt="Remove"
                                    className="cartitems-remove-icon"
                                    onClick={() => handleRemoveItem(item.ProductName)}
                                />
                            </div>
                            <hr />
                        </div>
                    ))}

                    <OfferItems
                        offers={offers}
                        selectedOffer={selectedOffer}
                        handleOfferSelect={handleOfferSelect}
                    />

                    <Checkout cartItems={cartItems} offerItem={selectedOffer}></Checkout>
                </>
            )}

        </div>
    );
};

export default CartItems;
