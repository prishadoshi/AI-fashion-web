"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { useCart } from "@/context/CartContext";

const Navbar = () => {
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [IsSearchBarOpen, setIsSearchBarOpen] = useState(false);
  const { setIsCartOpen, cartCount } = useCart();

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchProducts, setSearchProducts] = useState([]); // This will hold the AI results

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    // Only search if query is longer than 2 characters
    if (query.length > 2) {
      setIsSearching(true);
      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        const data = await response.json();
        // If data is an array, update the view
        if (Array.isArray(data)) {
          setSearchProducts(data);
        }
      } catch (error) {
        console.error("Semantic search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  console.log(searchProducts);

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const topRef = useRef(null);
  const bottomRef = useRef(null);

  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase.from("products").select("*");
      if (data) setProducts(data);
    }
    fetchProducts();
  }, []);

  const toggleAccordion = (name) => {
    setActiveAccordion((prev) => (prev === name ? null : name));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Optional: Close search if menu opens
    if (!isMobileMenuOpen) setIsSearchBarOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsDropDownOpen(false);
        setActiveAccordion(null);
      }
    }
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchBarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav className="navbar-container">
        {/* Desktop Navbar */}
        <div className="navbar">
          <div className="nav">
            <button
              ref={buttonRef}
              id="menu-btn"
              onClick={() => setIsDropDownOpen(!isDropDownOpen)}
            >
              <div className={`menu ${isDropDownOpen ? "active" : ""}`}>
                <span id="one"></span>
                <span id="two"></span>
                <span id="three"></span>
              </div>
              MENU
            </button>

            <div ref={searchRef}>
              <div id="search" onClick={() => setIsSearchBarOpen(true)}>
                <div className="search-image-logo">
                  <img src="/search_blu.svg" id="search-img" alt="search" />
                </div>
                <button>Search</button>
              </div>
            </div>

            <a className="title" href="/">
              <img src="/Group 2.svg" id="title" alt="logo" />
            </a>

            <button id="explore">
              <div id="explore-img">
                <img src="/Union 1.svg" alt="explore" />
              </div>
              <p className="Roman">EXPLORE</p>
            </button>

            <button
              id="cart"
              className="Roman"
              onClick={() => setIsCartOpen(true)}
            >
              CART ({cartCount})
            </button>
          </div>

          {/* Marquee Section */}
          <div id="marquee">
            <div id="marq">
              <p>
                New Winter Drop Now Live. Premium Essentials Designed for
                Everyday Comfort. 10% off Prepaid Orders..
              </p>
              <p>
                New Winter Drop Now Live. Premium Essentials Designed for
                Everyday Comfort. 10% off Prepaid Orders..
              </p>
            </div>
          </div>

          {/* Dropdown Menu */}
          {isDropDownOpen && (
            <div className="down-bar" ref={dropdownRef}>
              <div className="drop-down Roman">
                <div className="first">
                  <Link href="/shopAll">Shop All</Link>
                  <Link href="/category/Hoodie">Winter 25</Link>
                  <a href="#best">Best Seller</a>
                </div>
                <div className="topbottom Roman">
                  <button
                    className={`accordion ${activeAccordion === "top" ? "active" : ""}`}
                    onClick={() => toggleAccordion("top")}
                  >
                    Top
                  </button>

                  <div
                    ref={topRef}
                    className="panel"
                    style={{
                      maxHeight:
                        activeAccordion === "top"
                          ? topRef.current?.scrollHeight + "px"
                          : "0px",
                    }}
                  >
                    <div className="topbottom-options">
                      <Link href="/category/Polo">Polo</Link>
                      <Link href="/category/Zipper">Zipper</Link>
                      <Link href="/category/Hoodie">Hoodie</Link>
                      <Link href="/category/Shacket">Shacket</Link>
                    </div>
                  </div>
                  <button
                    className={`accordion ${activeAccordion === "bottom" ? "active" : ""}`}
                    onClick={() => toggleAccordion("bottom")}
                  >
                    Bottom
                  </button>

                  <div
                    ref={bottomRef}
                    className="panel"
                    style={{
                      maxHeight:
                        activeAccordion === "bottom"
                          ? bottomRef.current?.scrollHeight + "px"
                          : "0px",
                    }}
                  >
                    <div className="topbottom-options">
                      <Link href="/category/Sweatpant">Sweatpants</Link>
                      <Link href="/category/Trousers">Trousers</Link>
                    </div>
                  </div>
                </div>
                <div className="last Roman">
                  <a>Member's Login</a>
                  <a>Our Story</a>
                  <a>Contact Us</a>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="mobile-navbar">
        <div className="mobile-nav">
          <Link className="title" href="/">
            <img src="Group 2.svg" id="title" alt="logo" />
          </Link>
          <div className="mobile-nav-right">
            {/* Toggle Mobile Menu Class */}
            <button
              id="menu-btn"
              className={isMobileMenuOpen ? "active" : ""}
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? "Close" : "Menu"}
            </button>

            <div className="search-cart">
              {/* Toggle Search Bar */}
              <div id="search" onClick={() => setIsSearchBarOpen(true)}>
                <button>Search</button>
              </div>

              <button
                id="cart"
                className="Roman"
                onClick={() => setIsCartOpen(true)}
              >
                Cart ({cartCount})
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Body - Added 'active' class based on state */}
        <div className={`mobile-down-bar ${isMobileMenuOpen ? "active" : ""}`}>
          <div className="drop-down Roman">
            <div className="first">
              <Link href="/shopAll">Shop All</Link>
              <Link href="/new-arrivals">New Arrivals</Link>
              <Link href="/category/Hoodie">Winter 25</Link>
              <a href="#best">Best Seller</a>
            </div>

            <div className="topbottom Roman">
              <button
                className={`accordion ${activeAccordion === "mobile-top" ? "active" : ""}`}
                onClick={() => toggleAccordion("mobile-top")}
              >
                Top
              </button>
              <div
                className="panel"
                style={{
                  maxHeight: activeAccordion === "mobile-top" ? "200px" : "0px",
                  overflow: "hidden",
                  transition: "max-height 0.3s ease",
                }}
              >
                <div className="topbottom-options">
                  <Link href="/category/Polo">Polo</Link>
                  <Link href="/category/Zipper">Zipper</Link>
                  <Link href="/category/Hoodie">Hoodie</Link>
                  <Link href="/category/Shacket">Shacket</Link>
                </div>
              </div>

              <button
                className={`accordion ${activeAccordion === "mobile-bottom" ? "active" : ""}`}
                onClick={() => toggleAccordion("mobile-bottom")}
              >
                Bottom
              </button>
              <div
                className="panel"
                style={{
                  maxHeight:
                    activeAccordion === "mobile-bottom" ? "200px" : "0px",
                  overflow: "hidden",
                  transition: "max-height 0.3s ease",
                }}
              >
                <div className="topbottom-options">
                  <Link href="/category/Sweatpant">Sweatpants</Link>
                  <Link href="/category/Trousers">Trousers</Link>
                </div>
              </div>
            </div>

            <div className="last Roman">
              <a>Member's Login</a>
              <a>Our Story</a>
              <a>Contact Us</a>
            </div>
          </div>
        </div>

        <div id="marquee">
          <div id="marq">
            <p>
              New Winter Drop Now Live. Premium Essentials Designed for Everyday
              Comfort...
            </p>
            <p>
              New Winter Drop Now Live. Premium Essentials Designed for Everyday
              Comfort...
            </p>
          </div>
        </div>
      </div>

      <div ref={searchRef}>
        {/* 
          The 'active' class on this parent div should control 
          visibility/opacity for both desktop and mobile containers via CSS 
      */}
        <div className={`search-bar ${IsSearchBarOpen ? "active" : ""}`}>
          {/* DESKTOP SEARCH CONTAINER */}
          <div className="search-container desktop-only">
            <div className="search-top">
              <input
                id="searchInput"
                placeholder={
                  isSearching ? "AI is thinking..." : "Search here....."
                }
                value={searchTerm}
                onChange={handleSearch}
                autoComplete="off"
              />
              <div className="searchbar-right">
                <div className="searchbar-image">
                  {isSearching ? (
                    <div className="spinner"></div> // Add a small CSS spinner here
                  ) : (
                    <img
                      src="/search_blu.svg"
                      id="search-img"
                      alt="search icon"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="search-dis">
              <div className="search-links">
                {/* These stay static as quick filters */}
                <Link href="/category/Polo">Polo</Link>
                  <Link href="/category/Zipper">Zipper</Link>
                  <Link href="/category/Hoodie">Hoodie</Link>
                  <Link href="/category/Shacket">Shacket</Link>
                  <Link href="/category/Sweatpant">Sweatpants</Link>
                  <Link href="/category/Trousers">Trousers</Link>
              </div>

              <div className="search-pics">
                <div className="search-scroll">
                  {searchProducts.length > 0 ? (
                    searchProducts.map((product) => (
                      <div className="results-search-img" key={product.id}>
                        <Link
                          className="full-image"
                          href={`/product/${product.id}`}
                        >
                          <img
                            src={
                              product.images[0].startsWith("images/")
                                ? `/${product.images[0]}`
                                : product.images[0]
                            }
                            alt={product.title}
                          />
                        </Link>
                        <p>{product.title}</p>
                      </div>
                    ))
                  ) :  (
                    products.map((product) => (
                      <div className="search-img" key={product.id}>
                        <Link
                          className="full-image"
                          href={`/product/${product.id}`}
                        >
                          <img
                            src={
                              product.images[0].startsWith("images/")
                                ? `/${product.images[0]}`
                                : product.images[0]
                            }
                            alt={product.title}
                          />
                        </Link>
                        <p>{product.title}</p>
                
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* MOBILE SEARCH CONTAINER */}
          <div className="mobile-search-container mobile-only">
            <div className="search-top">
              <div className="search-top-left">
                <input
                  type="text"
                  placeholder="Search here....."
                  autoFocus={IsSearchBarOpen}
                />
              </div>
              {/* Close Button: Sets the state back to false */}
              <button
                className="close-search"
                onClick={() => setIsSearchBarOpen(false)}
              >
                X
              </button>
            </div>

            <div className="search-dis">
              <div className="search-links">
                <Link href="/category/Hoodie">hoodies</Link>
                <Link href="/category/Zipper">zipper</Link>
                <Link href="/category/Sweatpant">Sweatpants</Link>
                <Link href="/category/Polo">Polo</Link>
                <Link href="/category/Shacket">Shacket</Link>
                <Link href="/category/Tshirt">Tshirt</Link>
              </div>
              <div className="search-pics">
                <div className="search-scroll">
                  {products.map((product) => (
                    <div className="search-img" key={product.id}>
                      <Link
                        className="full-image"
                        href={`/product/${product.id}`}
                      >
                        <img
                          src={
                            product.images[0].startsWith("images/")
                              ? `/${product.images[0]}`
                              : product.images[0]
                          }
                          alt={product.title}
                        />
                      </Link>
                      <p>{product.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
