export const unixToISOString = (unixDate: number | undefined): string => {
  return (
    unixDate !== undefined ? new Date(unixDate * 1000) : new Date()
  ).toISOString();
};
