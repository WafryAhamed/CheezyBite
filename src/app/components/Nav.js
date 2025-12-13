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
  const [searchOpen, setSearchOpen] = useState(false);
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

  const navLinks = [
    { name: "Menu", href: "/menu" },
    { name: "Offers", href: "/menu?filter=offers" },
    { name: "Track Order", href: "/order/track" }, // Redirects to tracking input if needed, or specific
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-charcoalBlack/95 backdrop-blur-sm shadow-lg py-2"
          : "bg-charcoalBlack py-3"
          }`}
      >
        <div className="container mx-auto flex items-center justify-between px-4 relative">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 z-20">
            <Image src="/logo.svg" width={120} height={40} alt="CheezyBite" priority />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Search Bar - Expandable */}
            <div className={`relative flex items-center transition-all duration-300 ${searchOpen ? 'w-64 bg-softBlack rounded-full border border-cardBorder' : 'w-10'}`}>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 rounded-full hover:bg-white/10 transition-colors z-10 ${searchOpen ? 'bg-transparent' : ''}`}
              >
                {searchOpen ? <X className="w-5 h-5 text-ashWhite" /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-ashWhite"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>}
              </button>
              <input
                type="text"
                placeholder="Search pizza..."
                className={`bg-transparent outline-none text-ashWhite text-sm w-full pr-4 transition-opacity duration-200 ${searchOpen ? 'opacity-100 visible' : 'opacity-0 invisible absolute'}`}
                autoFocus={searchOpen}
              />
            </div>

            {/* Nav Links */}
            <ul className="flex items-center gap-6">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-ashWhite font-medium hover:text-secondary transition-colors duration-200 text-sm uppercase tracking-wide"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Phone Info */}
            <div className="flex gap-x-3 items-center border-l border-white/20 pl-6">
              <Phone className="w-8 h-8 text-secondary" />
              <div className="text-ashWhite">
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
              <ShoppingBag className="w-6 h-6 text-ashWhite" />
              {itemAmount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemAmount}
                </span>
              )}
            </button>

            {/* Login Button */}
            <Link href="/auth" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-ashWhite px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium">
              <User className="w-4 h-4" />
              <span>Login</span>
            </Link>
          </div>

          {/* Mobile: Cart + Hamburger */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full hover:bg-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-ashWhite"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            </button>

            {/* Mobile Cart Icon */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`relative p-2 rounded-full hover:bg-white/10 transition-all duration-200 ${cartBounce ? "animate-bounce-once" : ""
                }`}
              aria-label="Shopping cart"
            >
              <ShoppingBag className="w-6 h-6 text-ashWhite" />
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
                <X className="w-6 h-6 text-ashWhite" />
              ) : (
                <Menu className="w-6 h-6 text-ashWhite" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {searchOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-charcoalBlack border-t border-cardBorder p-4 animate-in slide-in-from-top-2">
            <input
              type="text"
              placeholder="Search pizza..."
              className="w-full bg-softBlack border border-cardBorder rounded-lg p-3 text-ashWhite outline-none focus:border-primary"
              autoFocus
            />
          </div>
        )}

        {/* Mobile Menu Dropdown */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <div className="container mx-auto px-4 py-4 border-t border-white/10 bg-charcoalBlack">
            <ul className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-ashWhite font-medium hover:text-secondary transition-colors duration-200 text-base uppercase tracking-wide block py-2"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-ashWhite px-4 py-3 rounded-full transition-all duration-200 text-sm font-medium w-full justify-center">
                  <User className="w-4 h-4" />
                  <span>Login / Sign Up</span>
                </Link>
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
