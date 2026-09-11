export interface PasswordValidationResult {
  isValid: boolean;
  message?: string;
  details: {
    minLength: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export function validateStrongPassword(password: string): PasswordValidationResult {
  const details = {
    minLength: typeof password === "string" && password.length >= 8,
    hasUpper: /[A-Z]/.test(password || ""),
    hasLower: /[a-z]/.test(password || ""),
    hasNumber: /[0-9]/.test(password || ""),
    hasSpecial: /[^A-Za-z0-9]/.test(password || ""),
  };

  const missing: string[] = [];
  if (!details.minLength) missing.push("at least 8 characters");
  if (!details.hasUpper) missing.push("an uppercase letter (A-Z)");
  if (!details.hasLower) missing.push("a lowercase letter (a-z)");
  if (!details.hasNumber) missing.push("a number (0-9)");
  if (!details.hasSpecial) missing.push("a special symbol (!@#$%^&*)");

  const isValid = missing.length === 0;

  return {
    isValid,
    message: isValid ? undefined : `Password must contain ${missing.join(", ")}.`,
    details,
  };
}
