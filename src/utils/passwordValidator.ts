export interface PasswordCriteria {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export interface PasswordStrength {
  score: number; // 0 - 4
  label: "Too Weak" | "Weak" | "Fair" | "Strong";
  color: string;
  isStrong: boolean;
  criteria: PasswordCriteria;
}

export function evaluatePassword(password: string): PasswordStrength {
  const p = password || "";

  const criteria: PasswordCriteria = {
    minLength: p.length >= 8,
    hasUpper: /[A-Z]/.test(p),
    hasLower: /[a-z]/.test(p),
    hasNumber: /[0-9]/.test(p),
    hasSpecial: /[^A-Za-z0-9]/.test(p),
  };

  let satisfiedCount = 0;
  if (criteria.minLength) satisfiedCount++;
  if (criteria.hasUpper) satisfiedCount++;
  if (criteria.hasLower) satisfiedCount++;
  if (criteria.hasNumber) satisfiedCount++;
  if (criteria.hasSpecial) satisfiedCount++;

  // Determine strength level
  let score = 0;
  let label: "Too Weak" | "Weak" | "Fair" | "Strong" = "Too Weak";
  let color = "text-red-500";

  if (!p) {
    score = 0;
    label = "Too Weak";
    color = "text-zinc-500";
  } else if (satisfiedCount < 3) {
    score = 1;
    label = "Weak";
    color = "text-red-500";
  } else if (satisfiedCount < 5) {
    score = 2;
    label = "Fair";
    color = "text-amber-500";
  } else {
    score = 4;
    label = "Strong";
    color = "text-emerald-500";
  }

  return {
    score,
    label,
    color,
    isStrong: satisfiedCount === 5,
    criteria,
  };
}
