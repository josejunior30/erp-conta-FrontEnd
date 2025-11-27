// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getAmountClass = (t: any): string => {
  if (t?.type === "inflow") return "text-success fw-semibold";
  if (t?.type === "outflow") return "text-danger fw-semibold";
  const a = t?.amount;
  if (typeof a !== "number") return "text-body";
  if (a > 0) return "text-success fw-semibold";
  if (a < 0) return "text-danger fw-semibold";
  return "text-body";
};
