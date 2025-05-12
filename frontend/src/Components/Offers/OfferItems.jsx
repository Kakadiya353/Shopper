import React from 'react';
import PropTypes from 'prop-types';
import './OfferItems.css'

function OfferItems({ offers, selectedOffer, handleOfferSelect }) {
    return (
        <div className="offers-section">
            <h3>Available Offers</h3>
            {offers.length === 0 ? (
                <p>No active offers</p>
            ) : (
                offers.map((offer) => (
                    <div key={offer._id} className="offer-card">
                        <h4>Offer name  &nbsp; : &nbsp; {offer.Title}</h4>
                        <p className='text-flow'>Description &nbsp;:&nbsp; {offer.Offer_Discription}</p>
                        <p className='text-flow'>Maximum &nbsp; : &nbsp;{offer.MaxDiscount}</p>
                        <p className='text-flow'>Minimum &nbsp;: &nbsp;{offer.MinDiscount}</p>
                        <p className='text-flow'>Discount &nbsp;:&nbsp; {offer.Discount}%</p>
                        <button className={`message-type ${selectedOffer?._id === offer._id ? 'cancel' : ''}`} onClick={() => handleOfferSelect(offer)}>
                            {selectedOffer?._id === offer._id ? 'Cancel' : 'Apply Offer'}
                        </button>

                    </div>
                ))
            )}
        </div>
    );
}

OfferItems.propTypes = {
    offers: PropTypes.array.isRequired,
    selectedOffer: PropTypes.object,
    handleOfferSelect: PropTypes.func.isRequired,
};

export default OfferItems;

