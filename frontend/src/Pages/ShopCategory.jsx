import React, { useEffect, useState } from 'react';
import './CSS/ShopCategory.css';
import dropdown_icon from '../Components/Assets/dropdown_icon.png';
import Item from '../Components/Item/Item';

const ShopCategory = (props) => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/products/popular') // or replace with /all if needed
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        // Filter by category passed from route
        const filtered = data.filter((item) =>
          item.Category?.toLowerCase() === (props.category?.toLowerCase() || '')
        );
        setProducts(filtered);
      })
      .catch((err) => {
        console.error("Error:", err);
        setError("Failed to load products.");
      });

  }, [props.category]); // Refetch if category changes

  return (
    <div className="shop-category">
      <img className='shopcategory-banner' src={props.banner} alt="Category Banner" />

      <div className="shopcategory-indexSort">
        <p>
          <span>Showing 1-{products.length}</span> out of {products.length} products
        </p>
        <div className="shopcategory-sort">
          Sort by <img src={dropdown_icon} alt="dropdown icon" />
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="shopcategory-products">
        {products.map((item, i) => (
          <Item
            key={i}
            id={item._id}
            name={item.Name}
            image={item.ImageURI ? `http://localhost:5000/public${item.ImageURI}` : 'path/to/placeholder-image.png'} // Fallback image
            new_price={item.Price}
            old_price={item.Old_Price}
            category={props.category}
          />
        ))}
      </div>

      <div className="shopcategory-loadmore">
        Explore more
      </div>
    </div>
  );
};

export default ShopCategory;
