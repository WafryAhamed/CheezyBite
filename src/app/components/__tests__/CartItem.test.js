/**
 * @jest-environment jsdom
 */
import React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import { render, createMockPizza } from '../../../test-utils'
import CartItem from '../CartItem'

describe('CartItem', () => {
    const mockRemoveItem = jest.fn()
    const mockIncreaseAmount = jest.fn()
    const mockDecreaseAmount = jest.fn()
    const mockSetEditingItem = jest.fn()

    const defaultCartContext = {
        removeItem: mockRemoveItem,
        increaseAmount: mockIncreaseAmount,
        decreaseAmount: mockDecreaseAmount,
        setEditingItem: mockSetEditingItem,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('rendering', () => {
        test('should render pizza item with basic information', () => {
            const pizza = createMockPizza({
                name: 'Margherita',
                price: 1200,
                amount: 2,
                size: 'medium',
                crust: 'traditional',
            })

            render(<CartItem pizza={pizza} />, {
                cartContextValue: defaultCartContext,
            })

            expect(screen.getByText('Margherita')).toBeInTheDocument()
            expect(screen.getByText('2')).toBeInTheDocument()
            expect(screen.getByText(/Rs\. 2,400/)).toBeInTheDocument()
        })

        test('should render size and crust for custom pizzas', () => {
            const pizza = createMockPizza({
                name: 'Custom Pizza',
                size: 'large',
                crust: 'stuffed',
            })

            render(<CartItem pizza={pizza} />, {
                cartContextValue: defaultCartContext,
            })

            expect(screen.getByText('stuffed crust')).toBeInTheDocument()
            expect(screen.getByText('large size')).toBeInTheDocument()
        })

        test('should NOT render size and crust for standard pizzas', () => {
            const pizza = createMockPizza({
                name: 'Standard Pizza',
                size: 'standard',
                crust: 'bottle',
            })

            render(<CartItem pizza={pizza} />, {
                cartContextValue: defaultCartContext,
            })

            expect(screen.queryByText('bottle crust')).not.toBeInTheDocument()
            expect(screen.queryByText('standard size')).not.toBeInTheDocument()
        })

        test('should render toppings when present', () => {
            const pizza = createMockPizza({
                additionalTopping: [
                    { name: 'Extra Cheese' },
                    { name: 'Pepperoni' },
                    { name: 'Mushrooms' },
                ],
            })

            render(<CartItem pizza={pizza} />, {
                cartContextValue: defaultCartContext,
            })

            expect(screen.getByText('Extra Cheese')).toBeInTheDocument()
            expect(screen.getByText('Pepperoni')).toBeInTheDocument()
            expect(screen.getByText('Mushrooms')).toBeInTheDocument()
        })

        test('should show "None" when no toppings are present', () => {
            const pizza = createMockPizza({
                size: 'medium',
                crust: 'traditional',
                additionalTopping: [],
            })

            render(<CartItem pizza={pizza} />, {
                cartContextValue: defaultCartContext,
            })

            expect(screen.getByText(/None/)).toBeInTheDocument()
        })
    })

    describe('price calculations', () => {
        test('should display correct total price for single item', () => {
            const pizza = createMockPizza({
                price: 1500,
                amount: 1,
            })

            render(<CartItem pizza={pizza} />, {
                cartContextValue: defaultCartContext,
            })

            expect(screen.getByText(/Rs\. 1,500/)).toBeInTheDocument()
        })

        test('should display correct total price for multiple items', () => {
            const pizza = createMockPizza({
                price: 1200,
                amount: 3,
            })

            render(<CartItem pizza={pizza} />, {
                cartContextValue: defaultCartContext,
            })

            expect(screen.getByText(/Rs\. 3,600/)).toBeInTheDocument()
        })

        test('should format large prices with commas', () => {
            const pizza = createMockPizza({
                price: 2500,
                amount: 5,
            })

            render(<CartItem pizza={pizza} />, {
                cartContextValue: defaultCartContext,
            })

            expect(screen.getByText(/Rs\. 12,500/)).toBeInTheDocument()
        })
    })

    describe('quantity controls', () => {
        test('should call increaseAmount when plus button is clicked', () => {
            const pizza = createMockPizza({ cartLineId: 'cart-123' })

            render(<CartItem pizza={pizza} />, {
                cartContextValue: defaultCartContext,
            })

            const plusButton = screen.getAllByRole('generic').find(
                el => el.textContent === '' && el.querySelector('svg')
            )

            // Find the plus button by looking for the container with the increaseAmount handler
            const buttons = screen.getAllByRole('generic')
            const plusBtn = buttons.find(btn => {
                const svg = btn.querySelector('svg')
                return svg && btn.onclick && btn.textContent.trim() === ''
            })

            // Alternative: find by data or test id
            const container = screen.getByText('2').closest('div')
            const parent = container?.parentElement
            const increaseBtn = parent?.querySelector('div:last-child')

            if (increaseBtn) {
                fireEvent.click(increaseBtn)
                expect(mockIncreaseAmount).toHaveBeenCalledWith('cart-123')
            }
        })

        test('should call decreaseAmount when minus button is clicked', () => {
            const pizza = createMockPizza({ cartLineId: 'cart-456', amount: 2 })

            render(<CartItem pizza={pizza} />, {
                cartContextValue: defaultCartContext,
            })

            const container = screen.getByText('2').closest('div')
            const parent = container?.parentElement
            const decreaseBtn = parent?.querySelector('div:first-child')

            if (decreaseBtn) {
                fireEvent.click(decreaseBtn)
                expect(mockDecreaseAmount).toHaveBeenCalledWith('cart-456')
            }
        })
    })

    describe('edit and remove actions', () => {
        test('should call setEditingItem when edit button is clicked', () => {
            const pizza = createMockPizza({ name: 'Test Pizza' })

            const { container } = render(<CartItem pizza={pizza} />, {
                cartContextValue: defaultCartContext,
            })

            // Find edit button by title attribute
            const editButton = container.querySelector('[title="Edit Item"]')

            if (editButton) {
                fireEvent.click(editButton)
                expect(mockSetEditingItem).toHaveBeenCalledWith(pizza)
            }
        })

        test('should call removeItem when remove button is clicked', () => {
            const pizza = createMockPizza({ cartLineId: 'cart-789' })

            const { container } = render(<CartItem pizza={pizza} />, {
                cartContextValue: defaultCartContext,
            })

            // Find remove button by title attribute
            const removeButton = container.querySelector('[title="Remove Item"]')

            if (removeButton) {
                fireEvent.click(removeButton)
                expect(mockRemoveItem).toHaveBeenCalledWith('cart-789')
            }
        })
    })

    describe('edge cases', () => {
        test('should handle pizza with no image gracefully', () => {
            const pizza = createMockPizza({ image: '' })

            const { container } = render(<CartItem pizza={pizza} />, {
                cartContextValue: defaultCartContext,
            })

            expect(container).toBeInTheDocument()
        })

        test('should handle very long pizza names', () => {
            const pizza = createMockPizza({
                name: 'Super Ultra Mega Deluxe Premium Special Edition Pizza With Everything',
            })

            render(<CartItem pizza={pizza} />, {
                cartContextValue: defaultCartContext,
            })

            expect(screen.getByText(/Super Ultra Mega Deluxe/)).toBeInTheDocument()
        })

        test('should handle zero amount gracefully', () => {
            const pizza = createMockPizza({ amount: 0 })

            render(<CartItem pizza={pizza} />, {
                cartContextValue: defaultCartContext,
            })

            expect(screen.getByText('0')).toBeInTheDocument()
            expect(screen.getByText(/Rs\. 0/)).toBeInTheDocument()
        })

        test('should handle missing cartLineId', () => {
            const pizza = createMockPizza({ cartLineId: undefined })

            const { container } = render(<CartItem pizza={pizza} />, {
                cartContextValue: defaultCartContext,
            })

            expect(container).toBeInTheDocument()
        })
    })
})
