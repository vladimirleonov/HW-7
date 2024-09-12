export const getTenSeccondsAgo = () => {
  return new Date(new Date().getTime() - 10000);
};
