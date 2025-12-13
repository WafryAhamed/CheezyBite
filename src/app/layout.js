import './globals.css';
import { Bangers, Quicksand, Roboto_Condensed } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-quicksand',
});

const bangers = Bangers({
  subsets: ['latin'],
  variable: '--font-bangers',
  weight: ['400'],
});

const robotoCondensed = Roboto_Condensed({
  subsets: ['latin'],
  variable: '--font-robotoCondensed',
  weight: ['300', '400', '700'],
});

export const metadata = {
  title: 'CheezyBite - Fresh Pizza Delivered',
  description: 'CheezyBite delivers the freshest, most delicious pizzas right to your door. Order online for fast delivery!',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <title>CheezyBite - Fresh Pizza Delivered</title>
      </head>
      <body className={`${quicksand.variable} ${bangers.variable} ${robotoCondensed.variable} font-robotoCondensed`} suppressHydrationWarning>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '10px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#f87171',
                secondary: '#fff',
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}