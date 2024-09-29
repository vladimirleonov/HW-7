export const toSnakeCase = (str: string): string => {
  return str
    .replace(/([A-Z])/g, '_$1') // Replace each capital letter with an underscore and a letter
    .toLowerCase(); // reduce the string to lowercase
};
