// components/navigation.tsx

import { useState } from "react";
import "../css/navigation.css";

export default function NavBar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <>
            <header className="navbar">
                <div className="middleNav">
                    <div className="imgNav">
                        <img src="/rpgpy-trans.png" alt="RPGPy Logo" />
                    </div>
                    
                    {/* Desktop Navigation */}
                    <nav className="innerNav">
                        <a className="contentNav" href="/">Home</a>
                        <a className="contentNav" href="/about">About</a>
                        <a className="LoginBtn" href="/Login">Login/SignUp</a>
                    </nav>

                    {/* Mobile Menu  */}
                    <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
                <a className="closeNav" onClick={toggleMobileMenu}>CLOSE</a>
                <a className="contentNav" href="/" onClick={toggleMobileMenu}>Home</a>
                <a className="contentNav" href="/about" onClick={toggleMobileMenu}>About</a>
                <a className="LoginBtn" href="/Login" onClick={toggleMobileMenu}>Login/SignUp</a>
            </div>
        </>
    );
}

export function FooterBar() {
    return (
        <footer className="footerContainer">
            <div className="innerFoot">
                <div className="footer-brand">
                    <img src="/rpgpy-trans.png" alt="RPGPy Logo" />
                    <p className="brand-description">
                        Learn Python through interactive gaming experiences designed for all skill levels.
                    </p>
                </div>
                
                <div className="innerCont">
                    <p className="text-title">Company Details</p>
                    <a className="text-cont" href="/about">About Us</a>
                    <a className="text-cont" href="/why-choose-us">Why Choose Us?</a>
                    <a className="text-cont" href="/contact">Contact</a>
                </div>
                
                <div className="innerCont">
                    <p className="text-title">How to Play</p>
                    <a className="text-cont" href="/tutorial">Tutorial</a>
                    <a className="text-cont" href="/guide">Game Guide</a>
                    <a className="text-cont" href="/faq">FAQ</a>
                </div>
                
                <div className="innerCont">
                    <p className="text-title">Resources</p>
                    <a className="text-cont" href="/documentation">Documentation</a>
                    <a className="text-cont" href="/examples">Code Examples</a>
                    <a className="text-cont" href="/community">Community</a>
                </div>
            </div>
            
            <div className="footer-bottom">
                <p>&copy; 2025 RPGPy. All rights reserved.</p>
            </div>
        </footer>
    );
}