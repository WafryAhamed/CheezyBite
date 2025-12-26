"use client";

import Image from "next/image";
import Link from "next/link";
import { useContext, useState, useEffect, useRef } from "react";
import { CartContext } from "../context/CartContext";
import { UserContext } from "../context/UserContext";
import { Menu, X, User, ShoppingCart } from "lucide-react";
import AuthModal from "./AuthModal";

const Nav = () => {
  const { isOpen, setIsOpen, itemAmount, toggleCart } = useContext(CartContext);
  const { user } = useContext(UserContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
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
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled
          ? "bg-charcoalBlack/95 backdrop-blur-sm shadow-lg py-2"
          : "bg-charcoalBlack py-4"
          }`}
      >
        <div className="container mx-auto flex items-center justify-between px-4 relative">

          {/* Left: Mobile Hamburger (Visible only on mobile) */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full hover:bg-white/10 transition-all duration-200 text-ashWhite"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Center/Left: Logo */}
          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:static lg:translate-x-0 lg:translate-y-0 flex items-center gap-2 z-20 hover:opacity-90 transition-opacity">
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
            {/* Desktop Login / Profile */}
            {user ? (
              <Link href="/profile" className="hidden lg:flex items-center gap-2 text-ashWhite hover:text-white transition-colors text-sm font-bold uppercase tracking-wide group">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 overflow-hidden relative group-hover:border-primary transition-colors">
                  {user.photo ? <Image src={user.photo} fill alt="User" className="object-cover" /> : <User className="w-4 h-4 text-primary group-hover:text-secondary transition-colors" />}
                </div>
                <span className="group-hover:text-secondary transition-colors">{user.name?.split(' ')[0] || 'User'}</span>
              </Link>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="hidden lg:flex items-center gap-2 text-ashWhite hover:text-white transition-colors text-sm font-bold uppercase tracking-wide group"
              >
                <User className="w-5 h-5 group-hover:text-secondary transition-colors" />
                <span className="group-hover:text-secondary transition-colors">Login</span>
              </button>
            )}

            {/* Cart Icon */}
            <button
              onClick={toggleCart}
              className="relative w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 flex items-center justify-center group"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <ShoppingCart className="w-4 h-4 text-primary group-hover:text-secondary transition-colors" />
              </div>

              {itemAmount > 0 && (
                <span className={`absolute top-0 right-0 bg-primary text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-charcoalBlack transition-transform duration-300 ${cartBounce ? 'scale-125' : 'scale-100'}`}>
                  {itemAmount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`lg:hidden transition-all duration-300 absolute top-full left-0 w-full bg-charcoalBlack border-t border-white/10 overflow-y-auto ${mobileMenuOpen ? "max-h-[calc(100dvh-80px)] opacity-100" : "max-h-0 opacity-0"
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

            {user ? (
              <Link
                href="/profile"
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary py-4 rounded-xl transition-all duration-200 font-bold uppercase tracking-wide"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden relative">
                  {user.photo ? <Image src={user.photo} fill alt="User" className="object-cover" /> : <User className="w-4 h-4" />}
                </div>
                <span>My Profile</span>
              </Link>
            ) : (
              <button
                onClick={() => { closeMobileMenu(); setAuthModalOpen(true); }}
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-ashWhite py-4 rounded-xl transition-all duration-200 font-bold uppercase tracking-wide"
              >
                <User className="w-5 h-5" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content overlap */}
      <div className="h-16"></div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />
    </>
  );
};

export default Nav;
