'use client';

import Image from "next/image";
import { MouseParallaxChild, MouseParallaxContainer } from "react-parallax-mouse";
import { Flame, Leaf, Utensils } from 'lucide-react';

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
    <section className="bg-pattern bg-cover bg-center bg-no-repeat min-h-[100vh] lg:min-h-[85vh] pt-20 lg:pt-24 relative overflow-hidden">
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-0"></div>

      <div className="container mx-auto min-h-[85vh] flex items-center justify-center relative z-10">
        <MouseParallaxContainer
          globalFactorX={0.3}
          globalFactorY={0.2}
          resetOnLeave
          className="w-full flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-4"
        >
          {/* LEFT: Content Section */}
          <MouseParallaxChild factorX={0.05} factorY={0.1}>
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1 px-6 lg:px-0 max-w-2xl">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <span className="text-secondary text-lg">★</span>
                <span className="text-white/90 text-sm font-medium">Colombo's #1 Pizza Delivery</span>
              </div>

              {/* Primary Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bangers text-white drop-shadow-lg leading-tight mb-4">
                Craft Your Perfect Pizza.
                <span className="block text-secondary">Delivered Hot & Fresh.</span>
              </h1>

              {/* Supporting Line */}
              <p className="text-white/80 text-lg lg:text-xl font-robotoCondensed mb-8 max-w-lg">
                Fresh ingredients · Handcrafted with love · Island-wide delivery to your doorstep
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {/* Primary CTA */}
                <button
                  onClick={scrollToMenu}
                  className="group relative px-8 py-4 bg-primary hover:bg-primaryHover text-white font-bold text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-primary/50 flex items-center justify-center gap-2"
                >
                  <span>Order Now</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>

                {/* Secondary CTA */}
                <button
                  onClick={scrollToMenu}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold text-lg rounded-full transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>View Menu</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-8 text-white/70 text-sm">
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
          </MouseParallaxChild>

          {/* RIGHT: Hero Image with Parallax */}
          <MouseParallaxChild factorX={0.15} factorY={0.2} className="relative flex-1 flex justify-center lg:justify-end">
            <div className="relative">
              {/* Main Pizza Image */}
              <div className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] lg:w-[550px] lg:h-[550px]">
                <Image
                  src="/pizza/pizza-3000282_1920.png"
                  fill
                  sizes="(max-width: 640px) 320px, (max-width: 1024px) 400px, 550px"
                  alt="Delicious freshly baked pizza with premium toppings"
                  priority
                  className="object-contain drop-shadow-2xl"
                />
              </div>

              {/* Floating Ingredient - Chilli 1 */}
              <MouseParallaxChild factorX={0.3} factorY={0.4} className="absolute -top-4 -left-8 hidden lg:block">
                <Flame className="w-12 h-12 text-red-500 drop-shadow-lg" />
              </MouseParallaxChild>

              {/* Floating Ingredient - Chilli 2 */}
              <MouseParallaxChild factorX={0.5} factorY={0.5} className="absolute top-8 -left-16 hidden lg:block">
                <Flame className="w-10 h-10 text-red-600 drop-shadow-lg rotate-12" />
              </MouseParallaxChild>

              {/* Floating Ingredient - Garlic */}
              <MouseParallaxChild factorX={0.4} factorY={0.6} className="absolute bottom-32 -left-20 hidden lg:block">
                <Utensils className="w-10 h-10 text-white/80 drop-shadow-lg p-2 bg-white/20 rounded-full backdrop-blur-sm" />
              </MouseParallaxChild>

              {/* Floating Ingredient - Leaves */}
              <MouseParallaxChild factorX={0.25} factorY={0.3} className="absolute bottom-16 left-0 hidden lg:block">
                <Leaf className="w-14 h-14 text-green-500 drop-shadow-lg rotate-45" />
              </MouseParallaxChild>

              {/* Floating Badge */}
              <div className="absolute -bottom-4 -right-4 lg:bottom-8 lg:right-0 bg-primary text-white rounded-full p-4 shadow-xl hidden sm:flex flex-col items-center justify-center w-24 h-24 lg:w-28 lg:h-28">
                <span className="text-xs font-medium uppercase">From</span>
                <span className="text-xl lg:text-2xl font-bangers">Rs. 1,390</span>
              </div>
            </div>
          </MouseParallaxChild>
        </MouseParallaxContainer>
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
