import React from 'react'
import { render } from '@testing-library/react'
import { CartContext } from '@/app/context/CartContext'

// Mock cart context with common default values
const mockCartContext = {
    cart: [],
    setCart: jest.fn(),
    addToCart: jest.fn(),
    removeItem: jest.fn(),
    increaseAmount: jest.fn(),
    decreaseAmount: jest.fn(),
    setEditingItem: jest.fn(),
    editingItem: null,
    itemAmount: 1,
    setItemAmount: jest.fn(),
}

/**
 * Custom render function that wraps components with necessary providers
 * @param {React.Component} ui - Component to render
 * @param {Object} options - Render options
 * @param {Object} options.cartContextValue - Override default cart context values
 * @param {Object} options.renderOptions - Additional options for @testing-library/react render
 */
export function renderWithProviders(
    ui,
    {
        cartContextValue = {},
        ...renderOptions
    } = {}
) {
    const contextValue = { ...mockCartContext, ...cartContextValue }

    function Wrapper({ children }) {
        return (
            <CartContext.Provider value={contextValue}>
                {children}
            </CartContext.Provider>
        )
    }

    return {
        ...render(ui, { wrapper: Wrapper, ...renderOptions }),
        contextValue,
    }
}

/**
 * Generate mock pizza data for testing
 */
export const createMockPizza = (overrides = {}) => ({
    id: '1',
    name: 'Margherita',
    image: '/images/margherita.png',
    price: 1200,
    size: 'medium',
    crust: 'traditional',
    additionalTopping: [],
    amount: 1,
    cartLineId: 'cart-item-1',
    ...overrides,
})

/**
 * Generate mock user data for testing
 */
export const createMockUser = (overrides = {}) => ({
    _id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    phone: '+94 77 123 4567',
    phone_verified: true,
    addresses: [],
    role: 'Customer',
    ...overrides,
})

/**
 * Generate mock order data for testing
 */
export const createMockOrder = (overrides = {}) => ({
    _id: 'order-123',
    orderNumber: 'ORD-20251215-001',
    user: 'user-123',
    items: [createMockPizza()],
    subtotal: 1200,
    deliveryFee: 200,
    total: 1400,
    status: 'pending',
    paymentStatus: 'pending',
    deliveryAddress: {
        street: '123 Main St',
        city: 'Colombo',
        area: 'Colombo 03',
        phone: '+94 77 123 4567',
    },
    createdAt: new Date().toISOString(),
    ...overrides,
})

/**
 * Generate mock topping data for testing
 */
export const createMockTopping = (overrides = {}) => ({
    name: 'Extra Cheese',
    price: 150,
    ...overrides,
})

// Re-export everything from React Testing Library
export * from '@testing-library/react'

// Override the default render with our custom one
export { renderWithProviders as render }
