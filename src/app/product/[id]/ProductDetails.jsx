"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "./product.css";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import ProductVisualizer from "./ProductVisualizer";
import recommendationsData from "@/data/ai_recommendations.json";
import allProducts from "@/data/products.json";

const ProductDetails = ({ product, relatedProducts }) => {
  const { addToCart } = useCart();

  const [isVisualizing, setIsVisualizing] = useState(false);
  const [modelPath, setModelPath] = useState(null);
  const sizeData = {
    XXS: { chest: 38, length: 25, shoulder: 16 },
    XS: { chest: 40, length: 26, shoulder: 17 },
    S: { chest: 42, length: 26.5, shoulder: 18 },
    M: { chest: 44, length: 27, shoulder: 19 },
    L: { chest: 46, length: 28, shoulder: 20 },
    XL: { chest: 48, length: 29, shoulder: 21 },
    XXL: { chest: 50, length: 30, shoulder: 22 },
    XXXL: { chest: 52, length: 31, shoulder: 23 },
  };

  const [selectedSize, setSelectedSize] = useState("M");
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const washCareRef = useRef(null);

  const measurements = sizeData[selectedSize];

  const recommendedTitles = recommendationsData[product.title] || [];

  // 2. Map those titles back to the full product objects
  const pairItems = recommendedTitles
    .map((title) => allProducts.find((p) => p.title === title))
    .filter(Boolean); // Ensure we don't have nulls

  if (pairItems.length === 0) return null;

  useEffect(() => {
    function handleClickOutside(e) {
      if (washCareRef.current && !washCareRef.current.contains(e.target)) {
        setActiveTab(null); // close container
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {

    const history = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");

    const filteredHistory = history.filter((item) => item.id !== product.id);
    const newHistory = [
      {
        id: product.id,
        title: product.title,
        price: product.price,
        images: product.images,
        discounted_price: product.discounted_price,
      },
      ...filteredHistory,
    ].slice(0, 4);

    localStorage.setItem("recentlyViewed", JSON.stringify(newHistory));
    setRecentlyViewed(filteredHistory.slice(0, 4));
  }, [product.id]);

  useEffect(() => {
    if (!product.images?.length) return;

    const firstImage = product.images[0];

    // polo_black.png → polo_black
    const fileName = firstImage.split("/").pop().split(".")[0];

    const glbPath = `/models/${fileName}.glb`;

    checkModelExists(glbPath);
  }, [product]);

  const checkModelExists = async (path) => {
    try {
      const res = await fetch(path, { method: "HEAD" });

      if (res.ok) {
        setModelPath(path);
      }
    } catch (err) {
      console.log("No 3D model found");
    }
  };

  return (
    <>
      <div>
        <div className="main-product">
          <div className="main-product-box">
            <div className="main-product-left">
              <div className="first-box">
                {product.discounted_price ? (
                  <div className="pdp-sale">
                    <button className="pdp-sale-button">Sale</button>
                  </div>
                ) : (
                  <></>
                )}
                <div className="first-title">
                  <div className="first-title-left">
                    <h1>{product.title}</h1>
                  </div>
                  <div className="pdp-product-price">
                    {product.discounted_price ? (
                      <>
                        <p
                          className="pdp-price-striked"
                          style={{ textDecoration: "line-through" }}
                        >
                          Rs. {product.price}
                        </p>
                        <p
                          className="pdp-discounted-price"
                          style={{ fontWeight: 600 }}
                        >
                          Rs. {product.price}
                        </p>
                      </>
                    ) : (
                      <p className="pdp-price">Rs. {product.price}</p>
                    )}
                  </div>
                </div>
                <p>{product.description}</p>
                <div className="small-pics">
                  {relatedProducts ? (
                    relatedProducts.map((item) => (
                      <Link key={item.id} href={`/product/${item.id}`}>
                        <img src={item.images[0]} alt="thumbnail" />
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm opacity-50">No related items found</p>
                  )}
                </div>
                <div className="product_dis">
                  <ul>
                    <li>Made In India</li>
                    <li>Oversized Fit</li>
                    <li>
                      <span>Model is 5'6 wearing S</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className={`size-chart ${isSizeChartOpen ? "active" : ""}`}>
                <div className="size-title">
                  <p>SIZE CHART (INCHES)</p>
                  <button
                    className="close"
                    onClick={() => setIsSizeChartOpen(false)}
                  >
                    X
                  </button>
                </div>
                <div>
                  <div className="chart-title">
                    <p>Size</p>
                    <p>Chest</p>
                    <p>Length</p>
                  </div>
                  <div className="chart-values">
                    <p>
                      <span id="size">XS</span> <span id="chest">40</span>{" "}
                      <span id="length">26</span>{" "}
                    </p>
                    <p>
                      <span id="size">S</span> <span id="chest">42</span>{" "}
                      <span id="length">36.5</span>{" "}
                    </p>
                    <p>
                      <span id="size">M</span> <span id="chest">44</span>{" "}
                      <span id="length">27</span>{" "}
                    </p>
                    <p>
                      <span id="size">L</span> <span id="chest">46</span>{" "}
                      <span id="length">27.5</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="main-product-center">
              <div className="space3"></div>
              {modelPath && (
                <a
                  onClick={() => setIsVisualizing(true)}
                  className="codepen-button"
                >
                  <span>View in 3D</span>
                </a>
              )}
              {product.images.map((img, idx) => (
                <img key={idx} src={img} alt={product.title} />
              ))}
            </div>

            <div className="main-product-right">
              <div className="third-box">
                <div className="measure-box ">
                  <div className="measure">
                    <p>
                      Chest <span id="chest">{measurements.chest}</span>
                      <sup className="inch">inch</sup>
                    </p>
                    <p>
                      Length <span id="length">{measurements.length}</span>
                      <sup className="inch">inch</sup>
                    </p>
                    <p>
                      Shoulder{" "}
                      <span id="shoulder">{measurements.shoulder}</span>
                      <sup className="inch">inch</sup>
                    </p>
                  </div>
                  <button
                    className="size-guide"
                    onClick={() => setIsSizeChartOpen(!isSizeChartOpen)}
                  >
                    Size Guide
                  </button>
                </div>
                <div className="sizes">
                  {Object.keys(sizeData).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={selectedSize === size ? "active" : ""}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <div className="delivery">
                  <button
                    className="cart enabled"
                    onClick={() => addToCart(product, selectedSize)}
                  >
                    ADD TO CART
                  </button>
                  <div className="delivery-text">
                    <p>
                      Delivery between <span>12th to 13th Nov</span>
                    </p>
                    <p className="red">Instant 20% on all prepaid order.</p>
                  </div>
                </div>

                <div className="info">
                  <div className="info-text">
                    <p>Weight - 240 GSM</p>
                    <p>Material - French Terry</p>
                    <p>Print- Screen Print</p>
                  </div>
                  <div className="links">
                    <a
                      onClick={() => setActiveTab("washcare")}
                      className="link"
                    >
                      Wash & Care
                    </a>
                    <a
                      onClick={() => setActiveTab("exchange")}
                      className="link"
                    >
                      Exchange / Refund
                    </a>
                    <a onClick={() => setActiveTab("support")} className="link">
                      Order Support
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="mobile-wash-info">
                <div className="info-text">
                    <p>Weight - 240 GSM</p>
                    <p>Material - French Terry</p>
                    <p>Print- Screen Print</p>
                </div>
                <div className="links">
                    <a onclick="openFromLink(this, 'washcare')" className="link">Wash & Care</a>
                    <a onclick="openFromLink(this, 'exchange')" className="link">Exchange / Refund</a>
                    <a onclick="openFromLink(this, 'support')"  className="link">Order Support</a>
                </div>
            </div> */}
          </div>
        </div>

       
        {pairItems.length > 0 && (
        <div className="products-display">
          <div className="contain8">
            <div className="heading">Pair it with</div>
            <ul className="products-box">
              {pairItems.map((item) => {
  const correctedItem = {
    ...item,
    // Assign title to id because the ProductCard uses ${id} for the Link
    id: item.id || item.title, 
    images: item.images.map((img) =>
      img.startsWith("/") ? img : `/${img}`
    ),
  };
  return <ProductCard key={item.title} {...correctedItem} />;
})}
            </ul>
          </div>
        </div>
      )}

        {recentlyViewed.length > 0 && (
          <div className="products-display">
            <div className="contain8">
              <div className="heading">Recently Visited</div>
              <ul className="products-box">
                {recentlyViewed.map((item) => (
                  <ProductCard key={item.id} {...item} />
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>


      <ProductVisualizer
        modelPath={modelPath}
        visible={isVisualizing}
        onClose={() => setIsVisualizing(false)}
        productData={product}
      />

      {/* <CartPopup 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          product={product}
          size= {selectedSize}
          items={cartItems}
        /> */}

      {activeTab && (
        <div className={`wash-care-container ${activeTab ? "active" : ""}`}>
          <div className="wash-care-div" ref={washCareRef}>
            <div className="wash-title">
              <button
                className={`wash-button ${activeTab === "washcare" ? "active" : ""}`}
                onClick={() => setActiveTab("washcare")}
              >
                WashCare
              </button>
              <button
                className={`wash-button ${activeTab === "exchange" ? "active" : ""}`}
                onClick={() => setActiveTab("exchange")}
              >
                Exchange
              </button>
              <button
                className={`wash-button ${activeTab === "support" ? "active" : ""}`}
                onClick={() => setActiveTab("support")}
              >
                Support
              </button>
            </div>
            <div className="wash-options">
              <div className="options-div">
                {activeTab === "washcare" && (
                  <div className="options">
                    <p className="options-title">Wash Care:</p>
                    <ul className="washcare-desc">
                      <li>
                        Machine wash with liquid detergent at 30°C or below
                      </li>
                      <li>Do not use bleach</li>
                      <li>Do not iron directly on the print</li>
                    </ul>
                  </div>
                )}
                {activeTab === "exchange" && (
                  <div className="options" id="exchange">
                    <p className="options-title">Exchange/Refund:</p>
                    <p className="exchange-desc">
                      We offer exchanges only and do not provide returns or
                      refunds
                    </p>

                    <div className="exchange-info">
                      <p>
                        <span>Exchange Period:</span> 7 days from delivery
                      </p>
                      <p>
                        <span>Condition:</span> Unworn & tagged
                      </p>
                      <p>
                        <span>Process:</span> Contact support team
                      </p>
                    </div>

                    <button className="option-button">Request Exchange</button>
                  </div>
                )}

                {activeTab === "support" && (
                  <div className="options" id="support">
                    <p className="options-title">Order Support:</p>
                    <p className="support-desc">
                      Our dedicated support team is here to help you with any
                      questions.
                    </p>
                    <button className="option-button">Contact Support</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetails;
