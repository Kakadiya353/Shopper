import React from 'react';
import './Item.css';
import { Link } from 'react-router-dom';

const Item = (props) => {
  const Email = localStorage.getItem('userEmail'); // Assuming you store email in localStorage

  const handleAddToCart = async () => {
    if (!props.category) {
      alert('Category is missing!');
      return;
    }

    const Quantity = 1;
    const Total = props.new_price * Quantity;

    try {
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Email}`,
        },
        body: JSON.stringify({
          ProductName: props.name,
          Category: props.category,
          Price: props.new_price,
          Email,
          Quantity,
          Total,
        }),
      });

      const data = await response.json();
      console.log('Add to cart response:', data);

      if (response.ok) {
        alert('Added to cart successfully!');
        // Optionally, call fetchCartCount() here if you have a way to update cart count
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        alert(data.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding to cart');
    }
  };

  return (
    <div className="item">
      <Link to={`/product/${props.id}`}>
        <img onClick={() => window.scrollTo(0, 0)} src={props.image} alt={props.name} />
      </Link>
      <p>{props.name}</p>
      <div className="item-prices">
        <div className="item-price-new">${props.new_price}</div>
        <div className="item-price-old">${props.old_price}</div>
      </div>
      <button className="add-to-cart-btn" onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
};

export default Item;
