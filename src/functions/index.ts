// eslint-disable-next-line @typescript-eslint/ban-types
export const isAsyncFunction = (fn: Function): boolean => {
  return fn.constructor.name === "AsyncFunction";
};
