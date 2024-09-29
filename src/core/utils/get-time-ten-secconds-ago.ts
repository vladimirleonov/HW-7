export const getTenSecondsAgo = () => {
  return new Date(new Date().getTime() - 10000);
};
