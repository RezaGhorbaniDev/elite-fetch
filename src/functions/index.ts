// eslint-disable-next-line @typescript-eslint/ban-types
export const isAsync = (fn: Function): boolean => {
  return fn.constructor.name === "AsyncFunction";
};
