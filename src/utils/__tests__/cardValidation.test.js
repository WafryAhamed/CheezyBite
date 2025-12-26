import {
    isValidLuhn,
    isValidExpiry,
    isValidCVV,
    isValidName,
    validateCardField,
} from '../cardValidation'

describe('cardValidation', () => {
    describe('isValidLuhn', () => {
        test('should return true for valid card numbers', () => {
            // Valid test card numbers (passing Luhn algorithm)
            expect(isValidLuhn('4532015112830366')).toBe(true) // Visa
            expect(isValidLuhn('5425233430109903')).toBe(true) // Mastercard
            expect(isValidLuhn('374245455400126')).toBe(false) // Amex (15 digits, should fail on 16-digit check)
        })

        test('should return false for invalid card numbers', () => {
            expect(isValidLuhn('4532015112830360')).toBe(false) // Invalid checksum
            expect(isValidLuhn('1234567890123456')).toBe(false) // Fails Luhn
            expect(isValidLuhn('0000000000000000')).toBe(false) // All zeros
        })

        test('should return false for non-16-digit numbers', () => {
            expect(isValidLuhn('453201511283036')).toBe(false) // 15 digits
            expect(isValidLuhn('45320151128303666')).toBe(false) // 17 digits
            expect(isValidLuhn('123')).toBe(false) // Too short
        })

        test('should handle numbers with spaces and dashes', () => {
            expect(isValidLuhn('4532 0151 1283 0366')).toBe(true) // With spaces
            expect(isValidLuhn('4532-0151-1283-0366')).toBe(true) // With dashes
        })

        test('should return false for empty or null values', () => {
            expect(isValidLuhn('')).toBe(false)
            expect(isValidLuhn(null)).toBe(false)
            expect(isValidLuhn(undefined)).toBe(false)
        })

        test('should return false for non-numeric strings', () => {
            expect(isValidLuhn('abcd1234efgh5678')).toBe(false)
            expect(isValidLuhn('not a card number')).toBe(false)
        })
    })

    describe('isValidExpiry', () => {
        // Mock current date for consistent testing
        beforeAll(() => {
            jest.useFakeTimers()
            jest.setSystemTime(new Date('2025-06-15'))
        })

        afterAll(() => {
            jest.useRealTimers()
        })

        test('should return true for valid future dates', () => {
            expect(isValidExpiry('12/25')).toBe(true) // Same year, future month
            expect(isValidExpiry('07/25')).toBe(true) // Same year, next month
            expect(isValidExpiry('06/26')).toBe(true) // Next year
            expect(isValidExpiry('12/30')).toBe(true) // Far future
        })

        test('should return false for past dates', () => {
            expect(isValidExpiry('05/25')).toBe(false) // Last month
            expect(isValidExpiry('12/24')).toBe(false) // Last year
            expect(isValidExpiry('01/20')).toBe(false) // Old card
        })

        test('should return true for current month/year', () => {
            expect(isValidExpiry('06/25')).toBe(true) // Current month and year
        })

        test('should return false for invalid month values', () => {
            expect(isValidExpiry('00/25')).toBe(false) // Month 0
            expect(isValidExpiry('13/25')).toBe(false) // Month 13
            expect(isValidExpiry('99/25')).toBe(false) // Invalid month
        })

        test('should return false for invalid formats', () => {
            expect(isValidExpiry('12/2025')).toBe(false) // 4-digit year
            expect(isValidExpiry('1/25')).toBe(false) // Single digit month
            expect(isValidExpiry('12-25')).toBe(false) // Wrong separator
            expect(isValidExpiry('1225')).toBe(false) // No separator
            expect(isValidExpiry('invalid')).toBe(false) // Non-date string
        })

        test('should return false for empty or null values', () => {
            expect(isValidExpiry('')).toBe(false)
            expect(isValidExpiry(null)).toBe(false)
            expect(isValidExpiry(undefined)).toBe(false)
        })
    })

    describe('isValidCVV', () => {
        test('should return true for valid 3-digit CVV', () => {
            expect(isValidCVV('123')).toBe(true)
            expect(isValidCVV('000')).toBe(true)
            expect(isValidCVV('999')).toBe(true)
        })

        test('should return false for invalid CVV lengths', () => {
            expect(isValidCVV('12')).toBe(false) // Too short
            expect(isValidCVV('1234')).toBe(false) // Too long (Amex)
            expect(isValidCVV('1')).toBe(false) // Single digit
        })

        test('should return false for non-numeric CVV', () => {
            expect(isValidCVV('abc')).toBe(false)
            expect(isValidCVV('12a')).toBe(false)
            expect(isValidCVV('a23')).toBe(false)
        })

        test('should return false for empty or null values', () => {
            expect(isValidCVV('')).toBe(false)
            expect(isValidCVV(null)).toBe(false)
            expect(isValidCVV(undefined)).toBe(false)
        })
    })

    describe('isValidName', () => {
        test('should return true for valid cardholder names', () => {
            expect(isValidName('John Doe')).toBe(true)
            expect(isValidName('Jane Smith')).toBe(true)
            expect(isValidName('Mary Ann Johnson')).toBe(true)
            expect(isValidName('Bob')).toBe(true) // 3 characters minimum
        })

        test('should return false for names that are too short', () => {
            expect(isValidName('AB')).toBe(false) // Less than 3 characters
            expect(isValidName('A')).toBe(false)
            expect(isValidName('  ')).toBe(false) // Only spaces
        })

        test('should return false for names with numbers or special characters', () => {
            expect(isValidName('John123')).toBe(false)
            expect(isValidName('Jane@Doe')).toBe(false)
            expect(isValidName('John-Doe')).toBe(false)
            expect(isValidName('O\'Brien')).toBe(false) // Apostrophe
        })

        test('should handle names with multiple spaces correctly', () => {
            expect(isValidName('John    Doe')).toBe(true) // Multiple spaces are allowed
        })

        test('should return false for empty or null values', () => {
            expect(isValidName('')).toBe(false)
            expect(isValidName(null)).toBe(false)
            expect(isValidName(undefined)).toBe(false)
        })
    })

    describe('validateCardField', () => {
        test('should validate card number field', () => {
            expect(validateCardField('number', '4532015112830366')).toBeNull()
            expect(validateCardField('number', '1234567890123456')).toBe('Invalid card number. Please check and try again.')
            expect(validateCardField('number', '')).toBe('Card number is required')
        })

        test('should validate expiry field', () => {
            jest.useFakeTimers()
            jest.setSystemTime(new Date('2025-06-15'))

            expect(validateCardField('expiry', '12/25')).toBeNull()
            expect(validateCardField('expiry', '01/20')).toBe('Card has expired or date is invalid.')
            expect(validateCardField('expiry', '')).toBe('Expiry date is required')

            jest.useRealTimers()
        })

        test('should validate CVV field', () => {
            expect(validateCardField('cvv', '123')).toBeNull()
            expect(validateCardField('cvv', '12')).toBe('Invalid CVV.')
            expect(validateCardField('cvv', '')).toBe('CVV is required')
        })

        test('should validate cardholder name field', () => {
            expect(validateCardField('name', 'John Doe')).toBeNull()
            expect(validateCardField('name', 'AB')).toBe('Enter cardholder name as shown on card.')
            expect(validateCardField('name', '')).toBe('Cardholder name is required')
        })

        test('should return null for unknown field names', () => {
            expect(validateCardField('unknown', 'value')).toBeNull()
            expect(validateCardField('', 'value')).toBeNull()
        })
    })
})
