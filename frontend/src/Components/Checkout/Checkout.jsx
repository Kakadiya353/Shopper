import React, { useEffect, useState } from 'react';
import './Checkout.css';
import axios from 'axios';

const Checkout = ({ cartItems, offerItem }) => {
    const [totalAmount, setTotalAmount] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [finalAmount, setFinalAmount] = useState(0);
    const [offerName, setOfferName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const userDetails = JSON.parse(localStorage.getItem('user'));
   
    useEffect(() => {
        if (!cartItems || cartItems.length === 0) return;

        const total = cartItems.reduce((acc, item) => acc + item.Total, 0);
        setTotalAmount(total);

        console.log('Offer Item:', offerItem);
        console.log('Cart Items:', cartItems);

        if (offerItem) {
            const discount = total * (offerItem.Discount / 100);

            if (total >= offerItem.MinDiscount && total <= offerItem.MaxDiscount) {
                setDiscountAmount(discount);
                setOfferName(offerItem.Title);
                setFinalAmount(total - discount);
                setErrorMessage('');
            } else {
                setErrorMessage(`Total must be between $${offerItem.MinDiscount} and $${offerItem.MaxDiscount} to apply this offer.`);
                setDiscountAmount(0);
                setFinalAmount(total);
            }
        } else {
            let discount = 0;
            let offer = '';

            if (total >= 100) {
                discount = total * 0.1;
                offer = '10% OFF on orders above $100';
            } else if (total >= 50) {
                discount = total * 0.05;
                offer = '5% OFF on orders above $50';
            }

            setDiscountAmount(discount);
            setOfferName(offer);
            setFinalAmount(total - discount);
            setErrorMessage('');
        }
    }, [cartItems, offerItem]);


    const orderProducts = cartItems.map((item) => ({
        ProductID: item._id,
        Quantity: item.Quantity,
        Total: item.Total,
    }));


    const handlePlaceOrder = async () => {
        const setOrderData = {
            Email: userDetails.email,  // not email, better userName
            DeliveryAddress: userDetails.address,
            OrderDateTime: new Date().toISOString(),
            TotalAmount: totalAmount ?? 0,
            OfferName: offerName ?? 'No Offer applied',
            DiscountAmount: discountAmount ?? 0,
            ActualAmount: finalAmount ?? 0,

            Products: orderProducts,   // ✅ use mapped orderProducts
        };

        console.log("Sending Order Data:", setOrderData);

        try {
            const response = await axios.post('http://localhost:5000/api/cart/add-order', setOrderData);
            console.log("Order placed successfully:", response.data);
            alert(response.data.message);
        } catch (error) {
            console.error("Error placing order:", error.response ? error.response.data : error.message);
            setErrorMessage(error.response ? error.response.data.message : "There was an error placing the order. Please try again.");
        }
    };

    return (
        <div className="checkout">
            <h2>Checkout Summary</h2>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <>
                    <div className="checkout-summary">
                        <p>Total Cart Amount: ${totalAmount.toFixed(2)}</p>
                        {offerName && (
                            <>
                                <p>Offer Applied: {offerName}</p>
                                <p>Discount Amount: -${discountAmount.toFixed(2)}</p>
                            </>
                        )}
                        <h3>Final Amount to Pay: ${finalAmount.toFixed(2)}</h3>
                    </div>
                    <button className="checkout-button" onClick={handlePlaceOrder}>
                        Place Order
                    </button>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </>
            )}
        </div>
    );
};

export default Checkout;
