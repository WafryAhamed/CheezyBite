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

  const navLinks = [
    { name: "Menu", href: "/menu" },
    { name: "Offers", href: "/offers" },
    { name: "Track Order", href: "/track" },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-charcoalBlack/95 backdrop-blur-sm shadow-lg py-2"
          : "bg-charcoalBlack py-4"
          }`}
      >
        <div className="container mx-auto flex items-center justify-between px-4 relative">

          {/* Left: Mobile Hamburger (Visible only on mobile) */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-all duration-200 text-ashWhite"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Center/Left: Logo */}
          <Link href="/" className="flex items-center gap-2 z-20 hover:opacity-90 transition-opacity">
            <Image src="/logo.svg" width={110} height={36} alt="CheezyBite" priority />
          </Link>

          {/* Center: Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <ul className="flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-ashWhite font-bold hover:text-secondary transition-colors duration-200 text-sm uppercase tracking-widest"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Actions (Cart + Login) */}
          <div className="flex items-center gap-4">
            {/* Desktop Login */}
            <Link href="/auth" className="hidden lg:flex items-center gap-2 text-ashWhite hover:text-white transition-colors text-sm font-bold uppercase tracking-wide">
              <span>Login / Guest</span>
            </Link>

            {/* Cart Icon */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`relative p-2 rounded-full hover:bg-white/10 transition-all duration-200 text-ashWhite group ${cartBounce ? "animate-bounce-once" : ""}`}
              aria-label="Shopping cart"
            >
              <ShoppingBag className="w-6 h-6 group-hover:text-secondary transition-colors" />
              {itemAmount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-charcoalBlack">
                  {itemAmount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 absolute top-full left-0 w-full bg-charcoalBlack border-t border-white/10 ${mobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <div className="container mx-auto px-4 py-6 flex flex-col gap-6">
            <ul className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="text-ashWhite font-bold hover:text-secondary transition-colors text-xl uppercase tracking-wide block py-2 border-b border-white/5"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/auth"
              onClick={closeMobileMenu}
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-ashWhite py-4 rounded-xl transition-all duration-200 font-bold uppercase tracking-wide"
            >
              <User className="w-5 h-5" />
              <span>Login / Guest</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content overlap */}
      <div className="h-16"></div>
    </>
  );
};

export default Nav;
