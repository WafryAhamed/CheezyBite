

// 25 Strict Products - No Dynamic Reading
// Source of Truth: User Provided List
export function getPizzas() {
    return [
        // --- CHICKEN ---
        {
            id: '1',
            name: 'Fire Grilled Chicken',
            image: '/pizzas/pizza1.jpg',
            description: 'Grilled chicken with crushed pepper and melted cheese.',
            category: 'Chicken',
            tags: ['Chicken', 'Spicy'],
            priceSm: 1400, priceMd: 1800, priceLg: 2400, rating: 4.8, ratingCount: 1240,
            toppings: []
        },
        {
            id: '2',
            name: 'BBQ Chicken Feast',
            image: '/pizzas/pizza2.jpg',
            description: 'Smoky BBQ chicken with onion and mozzarella.',
            category: 'Chicken',
            tags: ['Chicken'],
            priceSm: 1450, priceMd: 1850, priceLg: 2450, rating: 4.7, ratingCount: 980,
            toppings: []
        },
        // --- SPICY ---
        {
            id: '3',
            name: 'Volcano Chicken',
            image: '/pizzas/pizza3.jpg',
            description: 'Extra spicy chicken with fiery sauce and cheese.',
            category: 'Chicken',
            tags: ['Chicken', 'Spicy'],
            priceSm: 1500, priceMd: 1900, priceLg: 2500, rating: 4.6, ratingCount: 850,
            toppings: []
        },
        // --- CHEESE ---
        {
            id: '4',
            name: 'Triple Cheese Burst',
            image: '/pizzas/pizza4.jpg',
            description: 'Mozzarella, cheddar, and parmesan in every bite.',
            category: 'Cheese',
            tags: ['Cheese'],
            priceSm: 1600, priceMd: 2100, priceLg: 2800, rating: 4.9, ratingCount: 2100,
            toppings: []
        },
        // --- VEG ---
        {
            id: '5',
            name: 'Farmhouse Veg Supreme',
            image: '/pizzas/pizza5.jpg',
            description: 'Loaded with onion, capsicum, olives, and golden cheese.',
            category: 'Veg',
            tags: ['Veg'],
            priceSm: 1200, priceMd: 1600, priceLg: 2000, rating: 4.5, ratingCount: 750,
            toppings: []
        },
        // --- CHICKEN ---
        {
            id: '6',
            name: 'Classic Chicken Sausage',
            image: '/pizzas/pizza6.jpg',
            description: 'Chicken sausage slices with a rich tomato base.',
            category: 'Chicken',
            tags: ['Chicken'],
            priceSm: 1300, priceMd: 1700, priceLg: 2200, rating: 4.4, ratingCount: 600,
            toppings: []
        },
        // --- SPICY ---
        {
            id: '7',
            name: 'Hot Chilli Chicken',
            image: '/pizzas/pizza7.jpg',
            description: 'Red chilli flakes, hot sauce, and juicy chicken.',
            category: 'Chicken',
            tags: ['Chicken', 'Spicy'],
            priceSm: 1400, priceMd: 1800, priceLg: 2300, rating: 4.6, ratingCount: 820,
            toppings: []
        },
        // --- CHEESE ---
        {
            id: '8',
            name: 'Cheese Lovers Classic',
            image: '/pizzas/pizza8.jpg',
            description: 'Simple, rich, and ultra-cheesy.',
            category: 'Cheese',
            tags: ['Cheese'],
            priceSm: 1100, priceMd: 1500, priceLg: 1900, rating: 4.5, ratingCount: 900,
            toppings: []
        },
        // --- CHICKEN ---
        {
            id: '9',
            name: 'Pepper Chicken Crunch',
            image: '/pizzas/pizza9.jpg',
            description: 'Crispy chicken bites with bold pepper flavor.',
            category: 'Chicken',
            tags: ['Chicken', 'Spicy'],
            priceSm: 1450, priceMd: 1850, priceLg: 2400, rating: 4.7, ratingCount: 1100,
            toppings: []
        },
        // --- CHEESE ---
        {
            id: '10',
            name: 'Creamy Cheese Melt',
            image: '/pizzas/pizza10.jpg',
            description: 'Smooth creamy cheese with a soft base.',
            category: 'Cheese',
            tags: ['Cheese'],
            priceSm: 1250, priceMd: 1650, priceLg: 2150, rating: 4.6, ratingCount: 880,
            toppings: []
        },
        // --- SPICY ---
        {
            id: '11',
            name: 'Spicy Pepperoni Heat',
            image: '/pizzas/pizza11.jpg',
            description: 'Pepperoni-style chicken with bold spice.',
            category: 'Chicken',
            tags: ['Chicken', 'Spicy'],
            priceSm: 1550, priceMd: 1950, priceLg: 2600, rating: 4.8, ratingCount: 1500,
            toppings: []
        },
        // --- VEG ---
        {
            id: '12',
            name: 'Sweet Corn & Cheese',
            image: '/pizzas/pizza12.jpg',
            description: 'Classic sweet corn paired with rich melted cheese.',
            category: 'Veg',
            tags: ['Veg', 'Cheese'],
            priceSm: 1150, priceMd: 1550, priceLg: 2050, rating: 4.4, ratingCount: 700,
            toppings: []
        },
        // --- SPECIAL ---
        {
            id: '13',
            name: 'Street Style Chicken',
            image: '/pizzas/pizza13.jpg',
            description: 'Inspired by street-style spicy chicken flavors.',
            category: 'Chicken',
            tags: ['Chicken'],
            priceSm: 1350, priceMd: 1750, priceLg: 2250, rating: 4.7, ratingCount: 950,
            toppings: []
        },
        // --- CHICKEN ---
        {
            id: '14',
            name: 'Chicken Tikka Fusion',
            image: '/pizzas/pizza14.jpg',
            description: 'Indian-style tikka chicken with creamy cheese.',
            category: 'Chicken',
            tags: ['Chicken', 'Spicy'],
            priceSm: 1500, priceMd: 1900, priceLg: 2500, rating: 4.8, ratingCount: 1300,
            toppings: []
        },
        // --- CHEESE ---
        {
            id: '15',
            name: 'Golden Cheese Crunch',
            image: '/pizzas/pizza15.jpg',
            description: 'Crispy crust with deep cheese flavor.',
            category: 'Cheese',
            tags: ['Cheese'],
            priceSm: 1300, priceMd: 1700, priceLg: 2200, rating: 4.6, ratingCount: 800,
            toppings: []
        },
        // --- SPECIAL ---
        {
            id: '16',
            name: 'Smoky BBQ Fusion',
            image: '/pizzas/pizza16.jpg',
            description: 'BBQ sauce, chicken chunks, and cheese.',
            category: 'Chicken',
            tags: ['Chicken'],
            priceSm: 1450, priceMd: 1850, priceLg: 2450, rating: 4.7, ratingCount: 1050,
            toppings: []
        },
        // --- SPECIAL ---
        {
            id: '17',
            name: 'Ultimate Cheezy Bite',
            image: '/pizzas/pizza17.png', // Explicit .png
            description: 'Signature CheezyBite recipe with extra cheese.',
            category: 'Cheese',
            tags: ['Cheese'],
            priceSm: 1700, priceMd: 2200, priceLg: 2900, rating: 4.9, ratingCount: 2500,
            toppings: []
        },
        // --- CHICKEN ---
        {
            id: '18',
            name: 'Roasted Chicken Melt',
            image: '/pizzas/pizza18.jpg',
            description: 'Slow-roasted chicken with extra cheesy layers.',
            category: 'Chicken',
            tags: ['Chicken', 'Cheese'],
            priceSm: 1400, priceMd: 1800, priceLg: 2300, rating: 4.6, ratingCount: 920,
            toppings: []
        },
        // --- VEG ---
        {
            id: '19',
            name: 'Garden Fresh Veggie',
            image: '/pizzas/pizza19.jpg',
            description: 'Fresh capsicum, onion, tomato, sweet corn, and mozzarella on a soft base.',
            category: 'Veg',
            tags: ['Veg'],
            priceSm: 1150, priceMd: 1550, priceLg: 1950, rating: 4.5, ratingCount: 680,
            toppings: []
        },
        // --- VEG ---
        {
            id: '20',
            name: 'Cheesy Mushroom Delight',
            image: '/pizzas/pizza20.jpg',
            description: 'Juicy mushrooms with extra mozzarella and a creamy cheese finish.',
            category: 'Veg',
            tags: ['Veg', 'Cheese'],
            priceSm: 1250, priceMd: 1650, priceLg: 2100, rating: 4.6, ratingCount: 740,
            toppings: []
        },
        // --- SPICY ---
        {
            id: '21',
            name: 'Peri Peri Blast',
            image: '/pizzas/pizza21.jpg',
            description: 'Peri-peri chicken with smoky heat.',
            category: 'Chicken',
            tags: ['Chicken', 'Spicy'],
            priceSm: 1500, priceMd: 1900, priceLg: 2500, rating: 4.7, ratingCount: 1150,
            toppings: []
        },
        // --- CHEESE ---
        {
            id: '22',
            name: 'Four Cheese Magic',
            image: '/pizzas/pizza22.jpg',
            description: 'A perfect blend of four premium cheeses.',
            category: 'Cheese',
            tags: ['Cheese'],
            priceSm: 1650, priceMd: 2150, priceLg: 2850, rating: 4.9, ratingCount: 1800,
            toppings: []
        },
        // --- VEG ---
        {
            id: '23',
            name: 'Olive Pepper Veggie',
            image: '/pizzas/pizza23.jpg',
            description: 'Black olives, mild peppers, and light cheese for a balanced bite.',
            category: 'Veg',
            tags: ['Veg'],
            priceSm: 1200, priceMd: 1600, priceLg: 2000, rating: 4.4, ratingCount: 620,
            toppings: []
        },
        // --- SPICY ---
        {
            id: '24',
            name: 'Chilli Cheese Inferno',
            image: '/pizzas/pizza24.jpg',
            description: 'Melted cheese with green chilli heat (veg-friendly).',
            category: 'Spicy',
            tags: ['Spicy', 'Cheese'],
            priceSm: 1300, priceMd: 1700, priceLg: 2200, rating: 4.5, ratingCount: 790,
            toppings: []
        },
        // --- SPECIAL ---
        {
            id: '25',
            name: 'Chef’s Special Mix',
            image: '/pizzas/pizza25.jpg',
            description: 'A balanced mix of chicken, cheese, and mild spice.',
            category: 'Chicken',
            tags: ['Chicken', 'Cheese'],
            priceSm: 1550, priceMd: 1950, priceLg: 2600, rating: 4.8, ratingCount: 1400,
            toppings: []
        }
    ];
}
