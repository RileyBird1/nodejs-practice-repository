const { fahrenheitToCelsius } = require('../../src/utils/temperatures');

describe('Temperature Conversion Tests', () => {
    // Test 1: Check if freezing point (32°F) converts to 0°C
    test('should correctly convert 32°F (freezing point) to 0°C', () => {
        expect(fahrenheitToCelsius(32)).toBe(0);
    });

    // Test 2: Check if room temperature (70°F) converts to 21.11°C
    test('should correctly convert 70°F (room temperature) to 21.11°C', () => {
        expect(fahrenheitToCelsius(70)).toBe(21.11);
    });

    // Test 3: Check if the function throws an error for invalid input
    test('should throw TypeError when input is not a valid number', () => {
        expect(() => fahrenheitToCelsius('not a number')).toThrow(TypeError);
        expect(() => fahrenheitToCelsius('not a number')).toThrow('Input must be a valid number');
    });
});