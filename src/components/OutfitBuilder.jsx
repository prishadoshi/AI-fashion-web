"use client";
import React, { useState } from "react";
import { Rnd } from "react-rnd";
import { removeBackground } from "@imgly/background-removal";

const OutfitBuilder = ({ products }) => {
  const [canvasItems, setCanvasItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addToCanvas = async (product) => {
    setIsProcessing(true);

    try {
      // We remove publicPath to let the library use its default CDN
      const blob = await removeBackground(product.images[0], {
  model: "medium",
  // This is the key part: tell it how to handle the cross-origin request
  fetchArgs: {
    mode: 'cors',
    credentials: 'omit' 
  },
  progress: (key, current, total) => {
    console.log(`Downloading AI Model: ${key} ${Math.round((current / total) * 100)}%`);
  },
});

      const url = URL.createObjectURL(blob);
      setCanvasItems((prev) => [
        ...prev,
        { ...product, displayImage: url, instanceId: Date.now() },
      ]);
    } catch (error) {
      console.error("AI Error:", error);
      // If it fails, add the original image so the user isn't stuck
      setCanvasItems((prev) => [
        ...prev,
        { ...product, displayImage: product.images[0], instanceId: Date.now() },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };
  const removeItem = (id) => {
    setCanvasItems((prev) => prev.filter((item) => item.instanceId !== id));
  };

  return (
    <div style={{ display: "flex", height: "90vh" }}>
      {/* Sidebar */}
      <div
        className="wardrobe-sidebar"
        style={{
          width: "250px",
          borderRight: "1px solid #eee",
          padding: "10px",
          overflowY: "auto",
        }}
      >
        <h3>Wardrobe</h3>
        {isProcessing && (
          <p style={{ color: "orange" }}>✨ AI is removing background...</p>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => !isProcessing && addToCanvas(product)}
              style={{
                cursor: isProcessing ? "wait" : "pointer",
                border: "1px solid #eee",
                padding: "5px",
              }}
            >
              <img src={product.images[0]} width="100%" alt={product.title} />
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div
        className="canvas-area"
        style={{ flex: 1, position: "relative", background: "#fff" }}
      >
        {canvasItems.map((item) => (
          <Rnd
            key={item.instanceId}
            default={{
              x: item.x,
              y: item.y,
              width: item.width,
              height: item.height,
            }}
            bounds="parent"
          >
            <div
              style={{ position: "relative", width: "100%", height: "100%" }}
            >
              <button
                onClick={() => removeItem(item.instanceId)}
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  zIndex: 5,
                  border: "none",
                  background: "#000",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
              <img
                src={item.displayImage}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                alt="Clothing"
              />
            </div>
          </Rnd>
        ))}
      </div>
    </div>
  );
};

export default OutfitBuilder;
