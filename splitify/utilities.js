export const normalizePhone = (number) => number.replace(/\D/g, "");

//formats a 10-digit phone number into (xxx)-xxx-xxxx
export const formatPhoneNumber_1 = (number) => {
  const digits = number.replace(/\D/g, "");

  if (digits.length !== 10) {
    return number; // Return original if not exactly 10 digits
  }

  const areaCode = digits.slice(0, 3);
  const firstThree = digits.slice(3, 6);
  const lastFour = digits.slice(6);

  return `(${areaCode})-${firstThree}-${lastFour}`;
};

//formats a 10-digit phone number into xxx-xxx-xxxx
export const formatPhoneNumber_2 = (number) => {
  const digits = number.replace(/\D/g, "");

  if (digits.length !== 10) {
    return number; // Return original if not exactly 10 digits
  }

  const areaCode = digits.slice(0, 3);
  const firstThree = digits.slice(3, 6);
  const lastFour = digits.slice(6);

  return `${areaCode}-${firstThree}-${lastFour}`;
};
