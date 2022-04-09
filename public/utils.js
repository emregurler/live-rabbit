export const getUniqueArray = (array) => {
  if (array.length > 1) {
    return array.filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i);
  }

  return array;
};
