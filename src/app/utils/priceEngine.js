/**
 * Smart Price Engine - Real-World Pizza Pricing Logic
 * Mimics Pizza Hut / Domino's / Uber Eats pricing strategy
 */

// PricingConstants
const SIZE_MULTIPLIERS = {
  small: 1.0,
  medium: 1.2,
  large: 1.4,
};

const CRUST_PRICES = {
  traditional: 0,
  classic: 0,
  thin: 150,
  stuffed: 350,
};

const TOPPING_CONFIG = {
  freeCount: 3,        // First 3 toppings are free
  pricePerTopping: 150,  // Rs. 150 per extra topping
};

/**
 * Calculate the final price for a pizza with all customizations
 * @param {number} basePrice - Base price of the pizza (small size)
 * @param {string} size - 'small', 'medium', or 'large'
 * @param {string} crust - Crust type
 * @param {Array} toppings - Array of additional toppings
 * @returns {number} Final calculated price
 */
export function calculatePizzaPrice(basePrice, size, crust, toppings = []) {
  // 1. Apply size multiplier to base price
  const sizeMultiplier = SIZE_MULTIPLIERS[size?.toLowerCase()] || SIZE_MULTIPLIERS.small;
  let finalPrice = basePrice * sizeMultiplier;

  // 2. Add crust price
  const crustPrice = CRUST_PRICES[crust?.toLowerCase()] || 0;
  finalPrice += crustPrice;

  // 3. Calculate topping charges (first 3 free, then $2 each)
  const toppingCount = toppings.length;
  const chargeableToppings = Math.max(0, toppingCount - TOPPING_CONFIG.freeCount);
  const toppingPrice = chargeableToppings * TOPPING_CONFIG.pricePerTopping;
  finalPrice += toppingPrice;

  // Return price rounded to 2 decimal places
  return parseFloat(finalPrice.toFixed(2));
}

/**
 * Get pricing breakdown for transparency
 * @param {number} basePrice - Base price of the pizza
 * @param {string} size - Selected size
 * @param {string} crust - Selected crust
 * @param {Array} toppings - Selected toppings
 * @returns {Object} Breakdown of price components
 */
export function getPriceBreakdown(basePrice, size, crust, toppings = []) {
  const sizeMultiplier = SIZE_MULTIPLIERS[size?.toLowerCase()] || SIZE_MULTIPLIERS.small;
  const sizedPrice = basePrice * sizeMultiplier;
  const crustPrice = CRUST_PRICES[crust?.toLowerCase()] || 0;

  const toppingCount = toppings.length;
  const chargeableToppings = Math.max(0, toppingCount - TOPPING_CONFIG.freeCount);
  const toppingPrice = chargeableToppings * TOPPING_CONFIG.pricePerTopping;

  return {
    basePrice: parseFloat(sizedPrice.toFixed(2)),
    crustPrice: parseFloat(crustPrice.toFixed(2)),
    toppingPrice: parseFloat(toppingPrice.toFixed(2)),
    freeToppings: Math.min(toppingCount, TOPPING_CONFIG.freeCount),
    chargedToppings: chargeableToppings,
    total: calculatePizzaPrice(basePrice, size, crust, toppings),
  };
}

/**
 * Get size multiplier value
 * @param {string} size - Size name
 * @returns {number} Multiplier value
 */
export function getSizeMultiplier(size) {
  return SIZE_MULTIPLIERS[size?.toLowerCase()] || SIZE_MULTIPLIERS.small;
}

/**
 * Get crust price
 * @param {string} crust - Crust type
 * @returns {number} Crust price
 */
export function getCrustPrice(crust) {
  return CRUST_PRICES[crust?.toLowerCase()] || 0;
}

export default {
  calculatePizzaPrice,
  getPriceBreakdown,
  getSizeMultiplier,
  getCrustPrice,
  SIZE_MULTIPLIERS,
  CRUST_PRICES,
  TOPPING_CONFIG,
};
