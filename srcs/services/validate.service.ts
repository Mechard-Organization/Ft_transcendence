import validator from "validator";
import zxcvbn from "zxcvbn";

// Validation du mot de passe
export function validatePassword(password: string, username: string) {
  // Interdit "password == username"
  if (password.toLowerCase() === username.toLowerCase()) {
    return { ok: false, score: 0, reason: "Le mot de passe matche avec le username" };
  }

  // Règles strictes (tu peux adapter minLength etc.)
  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    return { ok: false, score: 0, reason: "Le mot de passe doit contenir au moins 1 minuscule, 1 majuscule et 1 chiffre et faire au moins 8 caractères de longueurs !" };
  }

  // Score zxcvbn
  const score = zxcvbn(password, [username]).score;

  return {
    ok: score >= 2,
    score,
    reason: score < 3 ? "Mot de passe trop faible" : "Mot de passe fort",
  };
}

export function validateEmail(email: string) {
  if (!email) return { ok: false, reason: "Email required" };

  if (!validator.isEmail(email, {
    allow_utf8_local_part: true,
    require_tld: true,
    allow_ip_domain: false,
    })) {
    return { ok: false, reason: "Invalid email format" };
  }

  return { ok: true, reason: "Valid email" };
}
