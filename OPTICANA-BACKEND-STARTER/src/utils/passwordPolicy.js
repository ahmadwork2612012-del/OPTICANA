// Shared rule for every place a staff password is set (create, change,
// admin reset, seed scripts), so the dashboard cannot be protected by a
// short or guessable password.

export const MIN_PASSWORD_LENGTH = 10;

const COMMON_PASSWORDS = new Set([
  "1234567890", "0123456789", "123456789a", "password1", "password12",
  "password123", "qwerty1234", "qwertyuiop", "admin12345", "opticana123",
  "iloveyou12", "abc1234567", "1q2w3e4r5t", "letmein123", "welcome123",
]);

function policyError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  error.code = "WEAK_PASSWORD";
  return error;
}

export function assertStrongPassword(password, { email = "", name = "" } = {}) {
  const value = String(password || "");

  if (value.length < MIN_PASSWORD_LENGTH) {
    throw policyError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  if (value.length > 128) {
    throw policyError("Password is too long");
  }
  if (!/\p{L}/u.test(value) || !/\d/.test(value)) {
    throw policyError("Password must contain both letters and numbers");
  }
  if (/^(.)\1+$/.test(value) || COMMON_PASSWORDS.has(value.toLowerCase())) {
    throw policyError("Password is too common");
  }

  const lowered = value.toLowerCase();
  const emailName = String(email).toLowerCase().split("@")[0];
  if (emailName.length >= 4 && lowered.includes(emailName)) {
    throw policyError("Password must not contain the email address");
  }
  const plainName = String(name).toLowerCase().replace(/\s+/g, "");
  if (plainName.length >= 4 && lowered.includes(plainName)) {
    throw policyError("Password must not contain the user's name");
  }

  return value;
}
