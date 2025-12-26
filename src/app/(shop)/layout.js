import SmartCart from '../components/SmartCart';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import CartProvider from '../context/CartContext';
import OrderProvider from '../context/OrderContext';
import { UserProvider } from '../context/UserContext';
import ClientCleanup from '../components/ClientCleanup';
import GlobalEditModal from '../components/GlobalEditModal';

export default function ShopLayout({ children }) {
    return (
        <UserProvider>
            <CartProvider>
                <OrderProvider>
                    <ClientCleanup />
                    <GlobalEditModal />
                    <Nav />
                    {children}
                    <SmartCart />
                    <Footer />
                </OrderProvider>
            </CartProvider>
        </UserProvider>
    );
}
