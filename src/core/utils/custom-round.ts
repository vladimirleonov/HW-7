function customRound(value) {
  if (Number.isInteger(value)) {
    return value;
  }

  // Round the number to 2 decimal places
  const rounded = Math.round(value * 100) / 100;

  // Check if the rounded number has no decimal part (e.g., ends in .00)
  // If true, return the number as an integer (without decimal places)
  return rounded % 1 === 0 ? Math.floor(rounded) : rounded;
}

export default customRound;
