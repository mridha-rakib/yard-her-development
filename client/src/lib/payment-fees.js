export const CUSTOMER_BOOKING_FEE = 3;

export const getCustomerCheckoutTotal = (jobSubtotal = 0) =>
  Number((Number(jobSubtotal || 0) + CUSTOMER_BOOKING_FEE).toFixed(2));
