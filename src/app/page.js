import Banner from './components/Banner';
import { getPizzas } from './utils/pizzaStore';
import { BestSellers, Highlights, HowItWorks, OffersBanner, SocialProof } from './components/LandingSections';

export default function Home() {
  const pizzas = getPizzas();

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

