"use client";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

const AddPopup = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState("S");
  const [showChart, setShowChart] = useState(false);

  if (!isOpen || !product) return null;

  // Measurement data - you can later pass this in the product prop
  const measurements = {
    S: { chest: 42, length: 26.5 },
    M: { chest: 44, length: 27.5 },
    L: { chest: 46, length: 28.5 },
    XL: { chest: 48, length: 29.5 },
  };

  const handleAdd = () => {
    addToCart(product, selectedSize);
    onClose(); // Close popup after adding
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("add-pop-up")) {
      onClose();
    }
  };

  return (
    <div className="add-pop-up active" onClick={handleOverlayClick}>
      <div className="add-box">
        {/* Background Overlay to close */}
        <div className="add-overlay" onClick={onClose}></div>
        
        <div className="add-group">
          <div className="add-title-div">
            <p className="add-title">{product.title}</p>
            <div className="add-price-text">
              {product.oldPrice && <p><span>Rs. {product.oldPrice}</span></p>}
              <p>Rs. {product.price}</p>
            </div>
          </div>

          <div className="add-measure-box">
            <div className="add-measure">
              <p>
                <span className="measure-label">Chest </span>
                <span className="measure-value">{measurements[selectedSize].chest}</span>
                <sup className="inch">inch</sup>
              </p>
              <p>
                <span className="measure-label">Length </span>
                <span className="measure-value">{measurements[selectedSize].length}</span>
                <sup className="inch">inch</sup>
              </p>
            </div>
            <button className="guide" onClick={() => setShowChart(true)}>Size Guide</button>
          </div>

          <div className="add-sizes">
            {["S", "M", "L", "XL"].map((size) => (
              <button
                key={size}
                className={selectedSize === size ? "active" : ""}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="delivery">
            <button className="cart enabled" onClick={handleAdd}>ADD TO CART</button>
            <div className="delivery-text">
              <p className="red">End of season sale is live</p>
            </div>
          </div>
        </div>
      </div>

      {/* Size Chart Overlay */}
      {showChart && (
        <div className="add-size-chart active">
          <div className="add-size-title">
            <p>SIZE CHARTS (INCHES)</p>
            <button className="add-close" onClick={() => setShowChart(false)}>X</button>
          </div>
          <div>
            <div className="add-chart-title">
              <p>Size</p><p>Chest</p><p>Length</p>
            </div>
            <div className="add-chart-values">
              {Object.keys(measurements).map((s) => (
                <div key={s} className="add-chart-row">
                  <p>{s}</p>
                  <p>{measurements[s].chest}</p>
                  <p>{measurements[s].length}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPopup;