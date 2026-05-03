"use client";
import React from 'react';
import { useCart } from '@/context/CartContext';

const CartPopup = () => {
    const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeItem, cartCount } = useCart();
  if (!isCartOpen) return null;

  // Calculate total price considering quantity for each item
  const totalPrice = cartItems.reduce((acc, item) => {
  // 1. Ensure item.price exists and is a string before calling .replace()
  const rawPrice = item.price ? String(item.price).replace(/,/g, '') : "0";
  
  // 2. Parse the result to a float
  const price = parseFloat(rawPrice) || 0;
  
  const qty = item.quantity || 1;
  return acc + (price * qty);
}, 0);

  return (
    <div className={`cart-popup ${isCartOpen ? "active" : ""}`}>
      <div className="popup-container">
        <div className="cart-container">
          <div className="cart-heading">
            <p>Your cart ({cartCount})</p>
            <button className="cart-close" onClick={()=> setIsCartOpen(false)}>X</button>
          </div>

          <div className="cart-items">
            {cartItems.length === 0 ? (
              <p className="cart-empty-msg" style={{ padding: '20px', textAlign: 'center' }}>
                Your bag is empty!
              </p>
            ) : (
              cartItems.map((item) => (
                <div className="cart-item" key={item.cartId}>
                  <div className="cart-pic">
                    <img src={item.images[0]} alt={item.title} />
                  </div>
                  <div className="item-desc">
                    <div className="item-title">
                      <p className="item-name">{item.title}</p>
                      <p className="item-cost">Rs. {item.price}</p>
                    </div>
                    <p className="item-size">{item.selectedSize}</p>
                    <div className="item-info">
                      <div className="item-quantity">
                        <button 
                          className="sub-item" 
                          onClick={() => updateQuantity(item.cartId, -1)}
                        >
                          -
                        </button>
                        <p className="quantity">{item.quantity || 1}</p>
                        <button 
                          className="add-item" 
                          onClick={() => updateQuantity(item.cartId, 1)}
                        >
                          +
                        </button>
                      </div>
                      <button 
                        className="remove-item" 
                        onClick={() => removeItem(item.cartId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="checkout-div">
            <button className="checkout" disabled={cartItems.length === 0}>
              <p>Checkout</p>
              <p className="total">Rs. {totalPrice.toLocaleString()}</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPopup;