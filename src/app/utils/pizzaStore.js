import fs from 'fs';
import path from 'path';

export function getPizzas() {
    const pizzaDir = path.join(process.cwd(), 'public/pizza');
    const filenames = fs.readdirSync(pizzaDir);

    const images = filenames.filter((file) =>
        /\.(jpg|jpeg|png|webp)$/i.test(file)
    );

    const descriptions = [
        "Authentic Sri Lankan spices blended with Italian herbs for a unique taste experience.",
        "Freshly baked with love, topped with premium mozzarella and locally sourced vegetables.",
        "A savory delight featuring our signature tomato sauce and hand-kneaded dough.",
        "Crispy crust loaded with generous toppings and melted cheese. A local favorite.",
        "Spicy and flavorful, perfectly capturing the essence of Sri Lankan fusion cuisine.",
        "Rich and creamy cheese blend on a perfectly char-grilled crust.",
        "Bursting with fresh flavors from our garden-fresh ingredients.",
        "A hearty meal perfect for sharing with family and friends.",
        "Traditional recipe with a modern twist, loved by everyone in Colombo.",
        "The ultimate comfort food, delivered hot and fresh to your doorstep."
    ];

    return images.map((filename, index) => {
        // consistently generate price and description based on index/filename to avoid hydration mismatches if possible, 
        // though here we just map index for stability.

        const name = formatPizzaName(filename);
        const priceBase = 1200 + ((index * 100) % 1500); // Randomish but deterministic price

        return {
            id: filename.replace(/\.[^/.]+$/, ""), // filename as ID
            name: name,
            description: descriptions[index % descriptions.length],
            image: `/pizza/${filename}`,
            priceSm: priceBase,
            priceMd: priceBase + 400,
            priceLg: priceBase + 800,
            toppings: [
                { image: '/cherry.png', name: 'cherry tomatoes', price: 150 },
                { image: '/corn.png', name: 'corn', price: 120 },
                { image: '/fresh-tomatoes.png', name: 'fresh tomatoes', price: 130 },
                { image: '/jalapeno.png', name: 'jalapeno', price: 140 },
                { image: '/parmesan.png', name: 'parmesan', price: 180 },
            ],
        };
    });
}

function formatPizzaName(filename) {
    // Remove extension
    let name = filename.replace(/\.[^/.]+$/, "");

    // Remove resolution suffixes like _1280 or -1280
    name = name.replace(/[_-]\d{3,4}(x\d{3,4})?$/i, "");

    // Replace remaining dashes/underscores with spaces
    name = name.replace(/[-_]/g, " ");

    // Remove "ai generated" prefix if present
    name = name.replace(/^ai generated/i, "");

    // Capitalize words
    return name.split(" ")
        .filter(word => word.length > 0)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
