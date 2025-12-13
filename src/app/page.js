import Banner from './components/Banner';
import PizzaGrid from './components/PizzaGrid';
import { getPizzas } from './utils/pizzaStore';

export default function Home() {
  const pizzas = getPizzas();

  // Force re-render to fix hydration mismatch

  return (
    <section>
      <Banner />
      <div className='container mx-auto px-4'>
        <PizzaGrid pizzas={pizzas} />
      </div>
    </section>
  );
}

