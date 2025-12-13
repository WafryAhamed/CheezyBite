import CartDesktop from '../components/CartDesktop';
import CartMobile from '../components/CartMobile';
import CartMobileIcon from '../components/CartMobileIcon';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import CartProvider from '../context/CartContext';
import OrderProvider from '../context/OrderContext';
import { UserProvider } from '../context/UserContext';
import ClientCleanup from '../components/ClientCleanup';
import GlobalEditModal from '../components/GlobalEditModal';

export default function ShopLayout({ children }) {
    return (
        <CartProvider>
            <UserProvider>
                <OrderProvider>
                    <ClientCleanup />
                    <GlobalEditModal />
                    <Nav />
                    <CartMobileIcon />
                    <CartMobile />
                    {children}
                    <CartDesktop />
                    <Footer />
                </OrderProvider>
            </UserProvider>
        </CartProvider>
    );
}
