'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import { Flame, Leaf, Pizza, CupSoda } from 'lucide-react';

const Banner = () => {
  // Smooth scroll to menu section
  const scrollToMenu = (e) => {
    e.preventDefault();
    const menuSection = document.getElementById("menu");
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="bg-pattern bg-cover bg-center bg-no-repeat min-h-[100vh] lg:min-h-[85vh] pt-20 lg:pt-24 pb-32 lg:pb-0 relative overflow-hidden">
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-0"></div>

      <div className="container mx-auto min-h-[85vh] flex items-center justify-center relative z-10">
        <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-4">

          {/* LEFT: Content Section */}
          <div className="flex flex-col items-start text-left flex-1 px-4 lg:px-0 max-w-2xl">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6 mt-4 lg:mt-0">
              <span className="text-secondary text-lg">★</span>
              <span className="text-white/90 text-sm font-medium">Delivery Available Only in Colombo</span>
            </div>

            {/* Primary Headline - Fade In + Up 12px */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="text-4xl sm:text-5xl lg:text-7xl font-poppins font-bold text-white drop-shadow-lg leading-tight mb-6"
            >
              Where Every Bite
              <span className="block text-secondary">Arrives Perfect.</span>
            </motion.h1>

            {/* Subtext - Fade In Only (Delayed) */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.08 }}
              className="text-white/80 text-lg lg:text-xl font-inter font-medium mb-8 max-w-sm lg:max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              30 min delivery · Fresh ingredients · Secure payments
            </motion.p>

            {/* CTA Buttons - Static Entry, Scalable Interaction */}
            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
              {/* Primary CTA */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 1.03 }}
                transition={{ duration: 0.12 }}
                onClick={scrollToMenu}
                className="group relative h-16 px-8 bg-primary hover:bg-primaryHover text-white font-inter font-semibold text-lg rounded-full shadow-lg hover:shadow-primary/50 flex items-center justify-center gap-2"
              >
                <span>Order Now</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.button>

              {/* Secondary CTA */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 1.03 }}
                transition={{ duration: 0.12 }}
                onClick={scrollToMenu}
                className="px-8 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-inter font-semibold text-lg rounded-full flex items-center justify-center gap-2"
              >
                <span>View Menu</span>
              </motion.button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 mt-8 text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>30-Min Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Fresh Ingredients</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Hero Image (Static, No Parallax) */}
          <div className="relative flex-1 flex justify-center lg:justify-end mb-12 lg:mb-0">
            <div className="relative">
              {/* Main Pizza Image */}
              <div className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] lg:w-[550px] lg:h-[550px]">
                <Image
                  src="/BG1.png"
                  fill
                  sizes="(max-width: 640px) 320px, (max-width: 1024px) 400px, 550px"
                  alt="Delicious freshly baked pizza with premium toppings"
                  priority
                  className="object-contain drop-shadow-2xl"
                />
              </div>

              {/* Floating Ingredient - Chilli 1 */}
              <div className="absolute -top-4 -left-8 hidden lg:block">
                <Flame className="w-12 h-12 text-red-500 drop-shadow-lg" />
              </div>

              {/* Floating Ingredient - Chilli 2 */}
              <div className="absolute top-8 -left-16 hidden lg:block">
                <Flame className="w-10 h-10 text-red-600 drop-shadow-lg rotate-12" />
              </div>

              {/* Floating Ingredient - Garlic (Pizza Icon) */}
              <div className="absolute bottom-32 -left-20 hidden lg:block">
                <Pizza className="w-10 h-10 text-white/80 hover:text-secondary transition-colors drop-shadow-lg p-2 bg-white/20 rounded-full backdrop-blur-sm" />
              </div>

              {/* Floating Ingredient - Drink (CupSoda) */}
              <div className="absolute bottom-16 left-0 hidden lg:block">
                <CupSoda className="w-14 h-14 text-white/80 hover:text-secondary transition-colors drop-shadow-lg -rotate-12" />
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-4 -right-4 lg:bottom-8 lg:right-0 bg-primary text-white rounded-full p-4 shadow-xl hidden sm:flex flex-col items-center justify-center w-24 h-24 lg:w-28 lg:h-28">
                <span className="text-xs font-medium uppercase">From</span>
                <span className="text-xl lg:text-2xl font-bangers">Rs. 1,390</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce hidden lg:block">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};

export default Banner;
