import priceEngine, {
    calculatePizzaPrice,
    getPriceBreakdown,
    getSizeMultiplier,
    getCrustPrice,
} from '../priceEngine'

describe('priceEngine', () => {
    describe('calculatePizzaPrice', () => {
        const basePrice = 1000 // Rs. 1000 base price

        describe('size multipliers', () => {
            test('should apply small multiplier (1.0)', () => {
                const price = calculatePizzaPrice(basePrice, 'small', 'traditional', [])
                expect(price).toBe(1000)
            })

            test('should apply medium multiplier (1.2)', () => {
                const price = calculatePizzaPrice(basePrice, 'medium', 'traditional', [])
                expect(price).toBe(1200)
            })

            test('should apply large multiplier (1.4)', () => {
                const price = calculatePizzaPrice(basePrice, 'large', 'traditional', [])
                expect(price).toBe(1400)
            })

            test('should default to small multiplier for unknown sizes', () => {
                const price = calculatePizzaPrice(basePrice, 'unknown', 'traditional', [])
                expect(price).toBe(1000)
            })

            test('should handle case-insensitive size names', () => {
                expect(calculatePizzaPrice(basePrice, 'SMALL', 'traditional', [])).toBe(1000)
                expect(calculatePizzaPrice(basePrice, 'Medium', 'traditional', [])).toBe(1200)
                expect(calculatePizzaPrice(basePrice, 'LarGe', 'traditional', [])).toBe(1400)
            })
        })

        describe('crust pricing', () => {
            test('should add no charge for traditional crust', () => {
                const price = calculatePizzaPrice(basePrice, 'medium', 'traditional', [])
                expect(price).toBe(1200) // base 1000 * 1.2 + 0
            })

            test('should add no charge for classic crust', () => {
                const price = calculatePizzaPrice(basePrice, 'medium', 'classic', [])
                expect(price).toBe(1200) // base 1000 * 1.2 + 0
            })

            test('should add Rs. 150 for thin crust', () => {
                const price = calculatePizzaPrice(basePrice, 'medium', 'thin', [])
                expect(price).toBe(1350) // base 1000 * 1.2 + 150
            })

            test('should add Rs. 350 for stuffed crust', () => {
                const price = calculatePizzaPrice(basePrice, 'medium', 'stuffed', [])
                expect(price).toBe(1550) // base 1000 * 1.2 + 350
            })

            test('should handle case-insensitive crust names', () => {
                expect(calculatePizzaPrice(basePrice, 'medium', 'THIN', [])).toBe(1350)
                expect(calculatePizzaPrice(basePrice, 'medium', 'Stuffed', [])).toBe(1550)
            })

            test('should default to 0 for unknown crust types', () => {
                const price = calculatePizzaPrice(basePrice, 'medium', 'unknown', [])
                expect(price).toBe(1200)
            })
        })

        describe('topping pricing', () => {
            test('should not charge for first 3 toppings', () => {
                const toppings = [
                    { name: 'Cheese', price: 150 },
                    { name: 'Pepperoni', price: 150 },
                    { name: 'Mushrooms', price: 150 },
                ]
                const price = calculatePizzaPrice(basePrice, 'medium', 'traditional', toppings)
                expect(price).toBe(1200) // No extra charge
            })

            test('should charge for 4th topping onwards', () => {
                const toppings = [
                    { name: 'Cheese', price: 150 },
                    { name: 'Pepperoni', price: 150 },
                    { name: 'Mushrooms', price: 150 },
                    { name: 'Olives', price: 150 }, // This one is charged
                ]
                const price = calculatePizzaPrice(basePrice, 'medium', 'traditional', toppings)
                expect(price).toBe(1350) // 1200 + 150
            })

            test('should charge correctly for multiple extra toppings', () => {
                const toppings = [
                    { name: 'Cheese', price: 150 },
                    { name: 'Pepperoni', price: 150 },
                    { name: 'Mushrooms', price: 150 },
                    { name: 'Olives', price: 150 },
                    { name: 'Onions', price: 150 },
                ]
                const price = calculatePizzaPrice(basePrice, 'medium', 'traditional', toppings)
                expect(price).toBe(1500) // 1200 + 150 + 150
            })

            test('should use individual topping prices when provided', () => {
                const toppings = [
                    { name: 'Cheese', price: 150 },
                    { name: 'Pepperoni', price: 150 },
                    { name: 'Mushrooms', price: 150 },
                    { name: 'Premium Truffle', price: 500 }, // Expensive topping
                ]
                const price = calculatePizzaPrice(basePrice, 'medium', 'traditional', toppings)
                expect(price).toBe(1700) // 1200 + 500
            })

            test('should use default price (150) for toppings without price', () => {
                const toppings = [
                    { name: 'Cheese' },
                    { name: 'Pepperoni' },
                    { name: 'Mushrooms' },
                    { name: 'Olives' }, // No price specified
                ]
                const price = calculatePizzaPrice(basePrice, 'medium', 'traditional', toppings)
                expect(price).toBe(1350) // 1200 + 150 (default)
            })

            test('should handle empty toppings array', () => {
                const price = calculatePizzaPrice(basePrice, 'medium', 'traditional', [])
                expect(price).toBe(1200)
            })
        })

        describe('complex scenarios', () => {
            test('should calculate correctly for large stuffed pizza with extra toppings', () => {
                const toppings = [
                    { name: 'Cheese', price: 150 },
                    { name: 'Pepperoni', price: 150 },
                    { name: 'Mushrooms', price: 150 },
                    { name: 'Olives', price: 150 },
                    { name: 'Onions', price: 150 },
                ]
                // Base: 1000 * 1.4 = 1400
                // Crust: +350
                // Toppings: 2 extra @ 150 each = +300
                // Total: 2050
                const price = calculatePizzaPrice(basePrice, 'large', 'stuffed', toppings)
                expect(price).toBe(2050)
            })

            test('should round to 2 decimal places', () => {
                const price = calculatePizzaPrice(1003, 'medium', 'traditional', [])
                expect(price).toBe(1203.6) // 1003 * 1.2 = 1203.6
                expect(price.toString()).toMatch(/^\d+\.\d{1,2}$/)
            })
        })

        describe('edge cases', () => {
            test('should handle null or undefined toppings', () => {
                const price = calculatePizzaPrice(basePrice, 'medium', 'traditional')
                expect(price).toBe(1200)
            })

            test('should handle null size gracefully', () => {
                const price = calculatePizzaPrice(basePrice, null, 'traditional', [])
                expect(price).toBe(1000) // Defaults to small
            })

            test('should handle null crust gracefully', () => {
                const price = calculatePizzaPrice(basePrice, 'medium', null, [])
                expect(price).toBe(1200) // No crust charge
            })
        })
    })

    describe('getPriceBreakdown', () => {
        const basePrice = 1000

        test('should return correct breakdown with no extras', () => {
            const breakdown = getPriceBreakdown(basePrice, 'medium', 'traditional', [])

            expect(breakdown).toEqual({
                basePrice: 1200,
                crustPrice: 0,
                toppingPrice: 0,
                freeToppings: 0,
                chargedToppings: 0,
                total: 1200,
            })
        })

        test('should return correct breakdown with crust upgrade', () => {
            const breakdown = getPriceBreakdown(basePrice, 'medium', 'stuffed', [])

            expect(breakdown).toEqual({
                basePrice: 1200,
                crustPrice: 350,
                toppingPrice: 0,
                freeToppings: 0,
                chargedToppings: 0,
                total: 1550,
            })
        })

        test('should correctly count free and charged toppings', () => {
            const toppings = [
                { name: 'Cheese', price: 150 },
                { name: 'Pepperoni', price: 150 },
                { name: 'Mushrooms', price: 150 },
                { name: 'Olives', price: 150 },
                { name: 'Onions', price: 150 },
            ]
            const breakdown = getPriceBreakdown(basePrice, 'medium', 'traditional', toppings)

            expect(breakdown.freeToppings).toBe(3)
            expect(breakdown.chargedToppings).toBe(2)
            expect(breakdown.toppingPrice).toBe(300)
        })

        test('should handle exactly 3 toppings (all free)', () => {
            const toppings = [
                { name: 'Cheese', price: 150 },
                { name: 'Pepperoni', price: 150 },
                { name: 'Mushrooms', price: 150 },
            ]
            const breakdown = getPriceBreakdown(basePrice, 'medium', 'traditional', toppings)

            expect(breakdown.freeToppings).toBe(3)
            expect(breakdown.chargedToppings).toBe(0)
            expect(breakdown.toppingPrice).toBe(0)
        })

        test('should round all prices to 2 decimal places', () => {
            const breakdown = getPriceBreakdown(1003, 'medium', 'thin', [])

            expect(breakdown.basePrice).toBe(1203.6)
            expect(breakdown.crustPrice).toBe(150)
            expect(breakdown.total).toBe(1353.6)
        })
    })

    describe('getSizeMultiplier', () => {
        test('should return correct multipliers', () => {
            expect(getSizeMultiplier('small')).toBe(1.0)
            expect(getSizeMultiplier('medium')).toBe(1.2)
            expect(getSizeMultiplier('large')).toBe(1.4)
        })

        test('should be case-insensitive', () => {
            expect(getSizeMultiplier('SMALL')).toBe(1.0)
            expect(getSizeMultiplier('Medium')).toBe(1.2)
            expect(getSizeMultiplier('LaRgE')).toBe(1.4)
        })

        test('should default to small for unknown sizes', () => {
            expect(getSizeMultiplier('unknown')).toBe(1.0)
            expect(getSizeMultiplier(null)).toBe(1.0)
            expect(getSizeMultiplier(undefined)).toBe(1.0)
        })
    })

    describe('getCrustPrice', () => {
        test('should return correct crust prices', () => {
            expect(getCrustPrice('traditional')).toBe(0)
            expect(getCrustPrice('classic')).toBe(0)
            expect(getCrustPrice('thin')).toBe(150)
            expect(getCrustPrice('stuffed')).toBe(350)
        })

        test('should be case-insensitive', () => {
            expect(getCrustPrice('TRADITIONAL')).toBe(0)
            expect(getCrustPrice('Thin')).toBe(150)
            expect(getCrustPrice('StUfFeD')).toBe(350)
        })

        test('should default to 0 for unknown crusts', () => {
            expect(getCrustPrice('unknown')).toBe(0)
            expect(getCrustPrice(null)).toBe(0)
            expect(getCrustPrice(undefined)).toBe(0)
        })
    })

    describe('module exports', () => {
        test('should export all functions and constants', () => {
            expect(priceEngine.calculatePizzaPrice).toBeDefined()
            expect(priceEngine.getPriceBreakdown).toBeDefined()
            expect(priceEngine.getSizeMultiplier).toBeDefined()
            expect(priceEngine.getCrustPrice).toBeDefined()
            expect(priceEngine.SIZE_MULTIPLIERS).toBeDefined()
            expect(priceEngine.CRUST_PRICES).toBeDefined()
            expect(priceEngine.TOPPING_CONFIG).toBeDefined()
        })

        test('should have correct constant values', () => {
            expect(priceEngine.SIZE_MULTIPLIERS).toEqual({
                small: 1.0,
                medium: 1.2,
                large: 1.4,
            })

            expect(priceEngine.CRUST_PRICES).toEqual({
                traditional: 0,
                classic: 0,
                thin: 150,
                stuffed: 350,
            })

            expect(priceEngine.TOPPING_CONFIG).toEqual({
                freeCount: 3,
                pricePerTopping: 150,
            })
        })
    })
})
