"use client";

import Image from "next/image";
import Link from "next/link";
import { useContext, useState, useEffect, useRef } from "react";
import { CartContext } from "../context/CartContext";
import { Menu, X, ShoppingBag, User, Phone } from "lucide-react";

const Nav = () => {
  const { isOpen, setIsOpen, itemAmount } = useContext(CartContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const prevItemAmount = useRef(itemAmount);

  // Scroll detection for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cart bounce animation on item add
  useEffect(() => {
    if (itemAmount > prevItemAmount.current) {
      setCartBounce(true);
      const timer = setTimeout(() => setCartBounce(false), 300);
      return () => clearTimeout(timer);
    }
    prevItemAmount.current = itemAmount;
  }, [itemAmount]);

  // Smooth scroll to menu section
  const scrollToMenu = (e) => {
    e.preventDefault();
    const menuSection = document.getElementById("menu");
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: "Menu", href: "#menu", onClick: scrollToMenu },
    { name: "Offers", href: "#", onClick: () => setMobileMenuOpen(false) },
    { name: "Track Order", href: "#", onClick: () => setMobileMenuOpen(false) },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-deepBlack/95 backdrop-blur-sm shadow-lg py-2"
          : "bg-deepBlack py-3"
          }`}
      >
        <div className="container mx-auto flex items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" width={120} height={40} alt="CheezyBite" priority />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Nav Links */}
            <ul className="flex items-center gap-6">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={link.onClick}
                    className="text-white font-medium hover:text-primary transition-colors duration-200 text-sm uppercase tracking-wide"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>

            {/* Phone Info */}
            <div className="flex gap-x-3 items-center border-l border-white/20 pl-6">
              <Phone className="w-8 h-8 text-primary" />
              <div className="text-white">
                <div className="font-robotoCondensed uppercase font-medium leading-none text-xs">
                  24/7 delivery
                </div>
                <div className="text-lg font-robotoCondensed font-bold leading-none tracking-wide">
                  +94 11 234 5678
                </div>
              </div>
            </div>

            {/* Cart Icon */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`relative p-2 rounded-full hover:bg-white/10 transition-all duration-200 ${cartBounce ? "animate-bounce-once" : ""
                }`}
              aria-label="Shopping cart"
            >
              <ShoppingBag className="w-6 h-6 text-white" />
              {itemAmount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemAmount}
                </span>
              )}
            </button>

            {/* Login Button */}
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium">
              <User className="w-4 h-4" />
              <span>Login</span>
            </button>
          </div>

          {/* Mobile: Cart + Hamburger */}
          <div className="flex lg:hidden items-center gap-3">
            {/* Mobile Cart Icon */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`relative p-2 rounded-full hover:bg-white/10 transition-all duration-200 ${cartBounce ? "animate-bounce-once" : ""
                }`}
              aria-label="Shopping cart"
            >
              <ShoppingBag className="w-6 h-6 text-white" />
              {itemAmount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemAmount}
                </span>
              )}
            </button>

            {/* Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full hover:bg-white/10 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <div className="container mx-auto px-4 py-4 border-t border-white/10">
            <ul className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={link.onClick}
                    className="text-white font-medium hover:text-primary transition-colors duration-200 text-base uppercase tracking-wide block py-2"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
              <li>
                <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-full transition-all duration-200 text-sm font-medium w-full justify-center">
                  <User className="w-4 h-4" />
                  <span>Login / Guest</span>
                </button>
              </li>
            </ul>

            {/* Phone Info Mobile */}
            <div className="flex gap-x-3 items-center mt-4 pt-4 border-t border-white/10">
              <Phone className="w-7 h-7 text-secondary" />
              <div className="text-white">
                <div className="font-robotoCondensed uppercase font-medium leading-none text-xs">
                  24/7 delivery
                </div>
                <div className="text-lg font-robotoCondensed font-bold leading-none tracking-wide">
                  +94 11 234 5678
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content overlap */}
      <div className="h-14 lg:h-16"></div>
    </>
  );
};

export default Nav;
