
/**
 * Generates a random ID string
 * @returns {string} A random string ID
 */
export const generateRandomId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};
