import React, { useEffect, useState } from 'react';
import './Popular.css';
import Item from '../Item/Item';

const Popular = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/products/popular')
      .then((response) => {
        if (!response.ok) {
          console.log("Fetched popular products:", response.data);
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => setPopularProducts(data))
      .catch((error) => {
        console.error('Error fetching popular products:', error);
        setError('Failed to load popular products');
        setPopularProducts([]);
      });
  }, []);

  return (
    <div className="popular">
      <h1>POPULAR IN WOMEN</h1>
      <hr />
      {error && <p className="error-message">{error}</p>}
      <div className="popular-item">
        <div className="popular-item">
          {popularProducts
            .filter(item => item.Category.toLowerCase() === "women")
            .map((item, i) => (
              <Item
                key={i}
                id={item._id}
                name={item.Name}
                image={item.ImageURI ? `http://localhost:5000/public${item.ImageURI}` : ''}
                new_price={item.Price}
                old_price={item.Old_Price}
                category={item.Category}
              />
            ))}
        </div>

      </div>
    </div>
  );
};

export default Popular;
