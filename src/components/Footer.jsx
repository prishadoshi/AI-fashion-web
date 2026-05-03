import React from 'react'

const Footer = () => {
  return (
    <div>
        <footer className="footer no-cursor">
        <div className="left">
            <div className="section Medium">
                <p className="section-button">Order Support</p>
                <div className="order-panel">
                    <a className="Roman">Refund/Return</a>
                    <a className="Roman">Track Order</a>
                </div>
            </div>
            <div className="section Medium">
                <p className="section-button">We are LemonLitt</p>
                <div className="order-panel">
                    <a className="Roman">About us</a>
                    <a className="Roman">Contact us</a>
                </div>
            </div>
            <div className="section Medium">
                <p className="section-button">Boring Stuff</p>
                <div className="order-panel">
                    <a className="Roman">Privacy Policy</a>
                    <a className="Roman">Cookies</a>
                    <a className="Roman">Shopping & Delivery</a>
                </div>
            </div>
            <div className="center-footer">
                <div className="inner-center">
                    <a className="Roman">Facebook</a>
                    <a className="Roman">Instagram</a>
                </div>
            </div>
            <div className="side-footer">
                <a className="title2">
                    <img src="Group 2.svg" id="title" />
                </a>
                <p>Lilt is a design-first lifestyle brand built for men who move with intention. From first dates to everyday moments, we create pieces that help you express yourself effortlessly — without trying too hard or paying too much. From sharp fits to subtle storytelling, we don’t just design clothes. We design confidence.</p>
            </div>
        </div>
        <div className="last-line">
          <p>Copyright © | Owned and Designed By Lemon Lilt</p>
        </div>
      </footer>
    </div>
  )
}

export default Footer;