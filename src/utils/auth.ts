// ==========================================================
// ADMIN LOGIN CONFIGURATION (HARDCODED MATH)
// ==========================================================
// These values allow verification without storing "dikythnks"
const PRIME_P = 170141183460469231731687303715884105727n;
const GENERATOR_G = 3n;
const LOCK_Y = 67603271658337404668565698564324881953n; 

// ==========================================================
// MATHEMATICAL HELPERS
// ==========================================================

// 1. Convert String -> BigInt (Maps the password to a number)
function stringToBigInt(str: string): bigint {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let hex = "0x";
  bytes.forEach((b) => (hex += b.toString(16).padStart(2, "0")));
  return BigInt(hex);
}

// 2. Modular Exponentiation (Calculates base^exp % mod efficiently)
function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) result = (result * base) % mod;
    exp = exp / 2n;
    base = (base * base) % mod;
  }
  return result;
}

// ==========================================================
// MAIN VERIFICATION FUNCTION
// ==========================================================

export function verifyAdminPassword(input: string): boolean {
  try {
    // A. Convert input to number
    const inputX = stringToBigInt(input);

    // B. Run the transformation: 3^(input) % Prime
    const calculatedLock = modPow(GENERATOR_G, inputX, PRIME_P);

    // C. Check if it matches the stored lock
    return calculatedLock === LOCK_Y;
  } catch (error) {
    console.error("Math error during verification:", error);
    return false;
  }
}

// ==========================================================
// EXAMPLE USAGE
// ==========================================================
// You can remove this part when connecting to your real frontend

// Test 1: Wrong Password
console.log("Testing 'wrongpass':", verifyAdminPassword("wrongpass")); // Should be false

// Test 2: Correct Password
console.log("Testing 'dikythnks':", verifyAdminPassword("dikythnks")); // Should be true
