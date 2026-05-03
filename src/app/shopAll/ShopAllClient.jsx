"use client";

import ProductCard from '@/components/ProductCard';
import React, { useState, useEffect, useRef } from 'react';

const ShopClient = ({ initialProducts }) => {
    const [isFilterOpen , setIsFilterOpen] = useState(false);
    const [products, setProducts] = useState(initialProducts);
    const [filteredProducts, setFilteredProducts] = useState(initialProducts);
    const [activeCategory, setActiveCategory] = useState("Shop All");
    
    //For filter popup
    const [tempCategory, setTempCategory] = useState("Shop All");
    const [appliedCategory, setAppliedCategory] = useState("Shop All");
    const [tempSize, setTempSize] = useState(null);
    const [appliedSize, setAppliedSize] = useState(null);

    const productImages = ["/img16.png", "/image1.png", "/image3.png", "/image4.png"];
    const categories = [
    "Shop All",
    "New Arrival",
    "Best Seller",
    "shirt",
    "shacket",
    "polo",
    "Tshirt",
    "zipper",
    "hoodie"
  ];

  const sizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

  const handleFilter = (category) => {
    setActiveCategory(category);

    if (category === "Shop All") {
      setFilteredProducts(initialProducts);
    } else if (category === "New Arrival") {
      // Show last 8 products added
      setFilteredProducts([...initialProducts].slice(-8).reverse());
    } else if (category === "Best Seller") {
      // Show first 8 products (or your custom logic)
      setFilteredProducts(initialProducts.slice(0, 8));
    } else {
      // Filter by the category column in Supabase
      const filtered = initialProducts.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
      setFilteredProducts(filtered);
    }
  };

  // Function to apply the filters 
  const handleApplyFilters = () => {
    setAppliedCategory(tempCategory);
    setAppliedSize(tempSize);
    
    if (tempCategory === "Shop All") {
      setFilteredProducts(initialProducts);
    }  else if (tempCategory === "New Arrival") {
      setFilteredProducts([...initialProducts].slice(-8).reverse());
    } else if (tempCategory === "Best Seller") {
      setFilteredProducts(initialProducts.slice(0, 8));
    } else {
      const filtered = initialProducts.filter(
        (p) => p.category.toLowerCase() === tempCategory.toLowerCase()
      );
      setFilteredProducts(filtered);
    }
    
    setIsFilterOpen(false); // Close popup after applying
  };

  const handleRemoveAll = () => {
    setTempCategory("Shop All");
    setAppliedCategory("Shop All");
    setFilteredProducts(initialProducts);
    setIsFilterOpen(false);
  };

  return (
    <>
    <div className="shopAll">
        <div id="top-line"></div>
        <div id="mid-line"></div>
        <div id="bottom-line"></div>
        <div className="shop-div">
            <div className="shop">
                <div className="shop-dis">
                    <div className="heading1">Shop All</div>
                    <p>crafted for comfort, built to last, and designed to elevate everyday wear. With premium fabrics, tailored cuts and subtle detailing, each pair blends relaxed ease with refined style. Whether you’re lounging at home or stepping out, move with confidence and look sharp doing it.</p>
                </div>
            </div>
        </div>
    </div>


    <div className="products-row">
        <div className="contain8">
            <ul className="product-cards">
                {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))
            ) : (
              <p>No products found in this category.</p>
            )}
            </ul>
        </div>
    </div>

    <div className="bar-container">
        <div className="bar">
            <div className='left-bar'>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => handleFilter(cat)}
                        className={activeCategory === cat ? "active-btn" : ""}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>
        </div>
        <div className="filter-sort" >
                <button className="filter" onClick={() => setIsFilterOpen(true)}>Filter & Sort</button>
        </div>
    </div>
    <div className={`filter-popup ${isFilterOpen ? 'active' : ''}`}>
        <div className="filter-container">
            <div className="advance-filter">
                <p>Advance filter</p>
                <button onClick={() => setIsFilterOpen(false)} className="filter-pop-button">X</button>
            </div>
            <div className="category">
                <p>Category</p>
                <div className="category-buttons">
                    {categories.map((cat) => (
                <button 
                  key={cat}
                  // Clicking only updates the TEMP state
                  onClick={() => setTempCategory(cat)}
                  className={tempCategory === cat ? "selected" : ""}
                >
                  {cat}
                </button>
              ))}
                </div>
            </div>
            <div className="size-top">
                <p>Size (top)</p>
                <div className="top-buttons">
                    {sizes.map((size) => (
                    <button
                        key={size}
                        // Updates state to the clicked size, or null if clicked again
                        onClick={() => setTempSize(tempSize === size ? null : size)}
                        className={tempSize === size ? "selected" : ""}
                    >
                        {size}
                    </button>
                    ))}
                </div>
            </div>
            {/* <div className="size-bottom">
                <p>Size (bottoms)</p>
                <div className="bottom-buttons">
                    <button>28</button>
                    <button>30</button>
                    <button>32</button>
                    <button>34</button>
                    <button>36</button>
                    <button>38</button>
                    <button>40</button>
                    <button>42</button>
                    <button>44</button>
                </div>
            </div> */}
            <div className="filter-buttons">
                <button className="remove-all" onClick={handleRemoveAll}>Remove All</button>
                <button className="apply" onClick={handleApplyFilters}>Apply</button>
            </div>
        </div>
    </div>
    
    </>
  )
}

export default ShopClient