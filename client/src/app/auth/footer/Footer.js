import React from 'react';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
    
    return (
        <>
            <footer className="footer">
                <div className="footer-main">
                    <div className="footer-columns">
                        <div className="footer-col">
                            <h4>Discover</h4>
                            <ul>
                                <li><a href="#">Great Deals</a></li>
                                <li><a href="#">Appliances</a></li>
                                <li><a href="#">Consoles</a></li>
                                <li><a href="#">Computers</a></li>
                                <li><a href="#">Jewellry</a></li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h4>Account</h4>
                            <ul>
                                <li><a href="#">My account</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-apps-social">
                        <div className="social-icons">
                            <a href="#" aria-label="Facebook"><FaFacebook size={24} /></a>
                            <a href="#" aria-label="Instagram"><FaInstagram size={24} /></a>
                            <a href="#" aria-label="LinkedIn"><FaLinkedin size={24} /></a>
                        </div>
                    </div>
                </div>
            </footer>
            {/* <div className="footer-sponsors">
                <img src="/visa.svg" alt="Visa" style={{ width: '60px', height: 'auto' }} />
            </div> */}
            <div className="footer-small">
                <span>© 2025 Horizon E-Commerce. All rights reserved.</span>
            </div>
        </>
    );
}