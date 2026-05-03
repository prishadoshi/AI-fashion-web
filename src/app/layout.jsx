import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
import "./index.css"
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import CartPopup from "@/components/CartPopUp";
import ClientGate from "@/components/ClientGate";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
    >
      <body className="">
        <CartProvider>
          {/* Wrap everything that needs to wait for the preloader */}
          {/* <ClientGate/> */}
            <Navbar />
            {children}
            <CartPopup />
            <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
