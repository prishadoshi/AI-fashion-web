"use client";

import React from "react";

// 1. Remove Metadata if it's already in your main app/layout.jsx
// 2. Change the function name to StylistLayout

export default function StylistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* We keep the Google Fonts link here so they only 
         load when the user is on the /stylist page.
      */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap"
        rel="stylesheet"
      />

      <div className="stylist-wrapper">{children}</div>

      <style jsx global>{`
        /* Add any fonts or resets specific to the builder here */
        body {
          font-family: "DM Sans", sans-serif;
        }
        h1,
        h2,
        .playfair {
          font-family: "Playfair Display", serif;
        }
      `}</style>
    </>
  );
}
