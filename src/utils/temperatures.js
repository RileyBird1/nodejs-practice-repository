/**
 * Converts a temperature input from Fahrenheit to Celsius.
 * The formula is: (°F - 32) × 5/9 = °C
 */

function fahrenheitToCelsius(fahrenheit) {
    // Checks if the input is a valid number
    if (typeof fahrenheit !== 'number') {
        throw new TypeError('Input must be a valid number');
    }

    // Apply the conversion formula listed above: (°F - 32) × 5/9
    const celsius = (fahrenheit - 32) * (5/9);

    // Round to 2 decimal places for precision
    return Number(celsius.toFixed(2));
}

// Export the function for use in other files
module.exports = {
    fahrenheitToCelsius
};

const temperature = fahrenheitToCelsius(68);  // Returns 20