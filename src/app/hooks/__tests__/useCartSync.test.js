/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor, act } from '@testing-library/react'
import useCartSync from '../useCartSync'

describe('useCartSync', () => {
    let mockSetCart

    beforeEach(() => {
        mockSetCart = jest.fn()
        // Clear localStorage before each test
        localStorage.clear()
        jest.clearAllMocks()
    })

    afterEach(() => {
        localStorage.clear()
    })

    test('should set up storage event listener on mount', () => {
        const addEventListenerSpy = jest.spyOn(window, 'addEventListener')

        const cart = []
        renderHook(() => useCartSync(cart, mockSetCart))

        expect(addEventListenerSpy).toHaveBeenCalledWith(
            'storage',
            expect.any(Function)
        )

        addEventListenerSpy.mockRestore()
    })

    test('should clean up event listener on unmount', () => {
        const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

        const cart = []
        const { unmount } = renderHook(() => useCartSync(cart, mockSetCart))

        unmount()

        expect(removeEventListenerSpy).toHaveBeenCalledWith(
            'storage',
            expect.any(Function)
        )

        removeEventListenerSpy.mockRestore()
    })

    test('should update cart when storage event occurs with new cart data', async () => {
        const initialCart = []
        const newCart = [
            { id: '1', name: 'Margherita', price: 1200, amount: 1 },
        ]

        renderHook(() => useCartSync(initialCart, mockSetCart))

        // Simulate storage event from another tab
        const storageEvent = new StorageEvent('storage', {
            key: 'cheezybite_cart',
            newValue: JSON.stringify(newCart),
            oldValue: JSON.stringify(initialCart),
        })

        window.dispatchEvent(storageEvent)

        await waitFor(() => {
            expect(mockSetCart).toHaveBeenCalledWith(newCart)
        })
    })

    test('should not update cart for non-cart storage events', () => {
        const cart = []

        renderHook(() => useCartSync(cart, mockSetCart))

        // Simulate storage event for a different key
        const storageEvent = new StorageEvent('storage', {
            key: 'some_other_key',
            newValue: JSON.stringify({ data: 'value' }),
        })

        window.dispatchEvent(storageEvent)

        expect(mockSetCart).not.toHaveBeenCalled()
    })

    test('should handle empty cart (cart cleared in another tab)', async () => {
        const initialCart = [
            { id: '1', name: 'Margherita', price: 1200, amount: 1 },
        ]

        renderHook(() => useCartSync(initialCart, mockSetCart))

        // Simulate cart being cleared in another tab
        const storageEvent = new StorageEvent('storage', {
            key: 'cheezybite_cart',
            newValue: null,
            oldValue: JSON.stringify(initialCart),
        })

        window.dispatchEvent(storageEvent)

        await waitFor(() => {
            expect(mockSetCart).toHaveBeenCalledWith([])
        })
    })

    test('should not update if cart data is the same', () => {
        const cart = [
            { id: '1', name: 'Margherita', price: 1200, amount: 1 },
        ]

        renderHook(() => useCartSync(cart, mockSetCart))

        // Simulate storage event with same cart data
        const storageEvent = new StorageEvent('storage', {
            key: 'cheezybite_cart',
            newValue: JSON.stringify(cart),
            oldValue: JSON.stringify(cart),
        })

        window.dispatchEvent(storageEvent)

        expect(mockSetCart).not.toHaveBeenCalled()
    })

    test('should handle invalid JSON gracefully', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
        const cart = []

        renderHook(() => useCartSync(cart, mockSetCart))

        // Simulate storage event with invalid JSON
        const storageEvent = new StorageEvent('storage', {
            key: 'cheezybite_cart',
            newValue: 'invalid json{{{',
        })

        window.dispatchEvent(storageEvent)

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error syncing cart across tabs:',
            expect.any(Error)
        )
        expect(mockSetCart).not.toHaveBeenCalled()

        consoleErrorSpy.mockRestore()
    })

    test('should prevent infinite loops with rapid updates', async () => {
        const cart = []
        const newCart1 = [{ id: '1', name: 'Pizza 1', price: 1000, amount: 1 }]
        const newCart2 = [{ id: '2', name: 'Pizza 2', price: 1200, amount: 1 }]

        renderHook(() => useCartSync(cart, mockSetCart))

        // Dispatch first event
        const event1 = new StorageEvent('storage', {
            key: 'cheezybite_cart',
            newValue: JSON.stringify(newCart1),
        })
        window.dispatchEvent(event1)

        // Immediately dispatch second event (simulating rapid updates)
        const event2 = new StorageEvent('storage', {
            key: 'cheezybite_cart',
            newValue: JSON.stringify(newCart2),
        })
        window.dispatchEvent(event2)

        // Should still process both updates
        await waitFor(() => {
            expect(mockSetCart).toHaveBeenCalled()
        })
    })

    test('should re-register listener when dependencies change', () => {
        const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
        const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

        const cart1 = []
        const cart2 = [{ id: '1', name: 'Pizza', price: 1000, amount: 1 }]

        const { rerender } = renderHook(
            ({ cart, setCart }) => useCartSync(cart, setCart),
            {
                initialProps: { cart: cart1, setCart: mockSetCart },
            }
        )

        const initialCallCount = addEventListenerSpy.mock.calls.length

        // Update the cart prop to trigger re-registration
        rerender({ cart: cart2, setCart: mockSetCart })

        // Should have removed old listener and added new one
        expect(removeEventListenerSpy).toHaveBeenCalled()
        expect(addEventListenerSpy.mock.calls.length).toBeGreaterThan(initialCallCount)

        addEventListenerSpy.mockRestore()
        removeEventListenerSpy.mockRestore()
    })
})
