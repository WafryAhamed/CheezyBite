// Force Re-compile 2
import Banner from '../components/Banner';
// import { getPizzas } from '../utils/pizzaStore';
import { BestSellers, Highlights, HowItWorks, OffersBanner, SocialProof } from '../components/LandingSections';
import { headers } from 'next/headers';

async function getData() {
  try {
    const headersList = await headers();
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    const [pizzasRes, toppingsRes] = await Promise.all([
      fetch(`${baseUrl}/pizzas`, { cache: 'no-store', headers: headersList }),
      fetch(`${baseUrl}/toppings`, { cache: 'no-store', headers: headersList })
    ]);

    if (!pizzasRes.ok || !toppingsRes.ok) throw new Error('Failed to fetch data');

    const pizzasData = await pizzasRes.json();
    const toppingsData = await toppingsRes.json();

    const pizzas = pizzasData.success ? pizzasData.data : [];
    const toppings = toppingsData.success ? toppingsData.data : [];

    const activeToppings = toppings.filter(t => t.enabled);

    return pizzas.map(pizza => ({
      ...pizza,
      toppings: activeToppings
    }));
  } catch (error) {
    console.error('Error fetching home data:', error);
    return [];
  }
}

export default async function Home() {
  const pizzas = await getData();

  return (
    <main>
      <Banner />
      <Highlights />
      <BestSellers pizzas={pizzas} />
      <OffersBanner />
      <HowItWorks />
      <SocialProof />
    </main>
  );
}

