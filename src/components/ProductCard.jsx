"use client";

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import AddPopup from './AddPopUp';

const ProductCard = (product) => {
  const { id, title, price, images, discounted_price } = product;
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const nextImg = (e) => {
    e.preventDefault();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImg = (e) => {
    e.preventDefault();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <li className="product-container">
      <div className="product-buttons">
        <button className="prev" onClick={prevImg}>←</button>
        <button className="next" onClick={nextImg}>→</button>
      </div>
      <Link className="img-box" href={`/product/${id}`}>
        <div className="img-container">
          <div className="img-text">
            <p>New</p>
           {discounted_price && <p className="sale">Sale</p>}
          </div>
          {images.map((img, index) => (
            <img 
              key={index}
              src={img} 
              alt={title} 
              className={`product-img ${index === currentImgIndex ? 'active' : ''}`}
              style={{ display: index === currentImgIndex ? 'block' : 'none' }}
            />
          ))}
        </div>
        <div className="img-description">
          <div className="img-desc-text">
            <h1>{title}</h1>
            <p className="thin">
              {discounted_price ? (
                <>
                  <span style={{ textDecoration: 'line-through', color: '#888', marginRight: '8px' }}>
                    Rs. {price}
                  </span>
                  Rs. {discounted_price}
                </>
              ) : (
                `Rs. ${price}`
              )}
            </p>
          </div>
        </div>
      </Link>
      <button className="add-btn" onClick={() => setIsAddOpen(true)}>+</button>
      <AddPopup 
        product={product} 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
      />
    </li>
  );
};

export default ProductCard;