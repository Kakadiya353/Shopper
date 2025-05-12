// src/components/NewCollections/NewCollections.jsx
import React, { useEffect, useState } from 'react';
import './NewCollections.css';
import Item from '../Item/Item';

const NewCollections = () => {
  const [newCollections, setNewCollections] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/products/new')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        setNewCollections(data);
        console.log('Fetched new collections:', data);
      })
      .catch(err => {
        console.error('Error fetching new collections:', err);
        setError('Failed to load new collections');
        setNewCollections([]);
      });
  }, []);

  return (
    <div className="new-collections">
      <h1>NEW COLLECTIONS</h1>
      <hr />
      {error && <p className="error-message">{error}</p>}
      <div className="collections">
        {newCollections.map(item => (
          <Item
            key={item._id}
            id={item._id}
            name={item.Name}
            image={item.ImageURI}        
            new_price={item.Price}
            old_price={item.Old_Price}
          />
        ))}
      </div>
    </div>
  );
};

export default NewCollections;
