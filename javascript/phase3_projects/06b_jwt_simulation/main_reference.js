// Reference driver — the full JWT flow.
const { TokenService, InvalidSignature, TokenExpired } = require("./tokenService_reference");

const tokens = new TokenService();

function run(label, action) {
  try {
    console.log(label, "→", action());
  } catch (err) {
    if (err instanceof InvalidSignature || err instanceof TokenExpired) {
      console.log(label, "→ REJECTED:", err.message);
    } else throw err;
  }
}

// 1. create a valid token (expires 1 minute from now)
const valid = tokens.createToken({ username: "kishore", role: "admin", exp: Date.now() + 60000 });
console.log("token:", valid);

// 2. decode without verifying — anyone can read the payload (base64 only)
console.log("decoded (no verify):", tokens.decode(valid));

// 3. verify the valid token → returns the claims
run("verify valid  ", () => tokens.verifyToken(valid));

// 4. TAMPER: change payload to superadmin, keep the OLD signature
const [, oldSig] = valid.split(".");
const fakePayload = Buffer.from(
  JSON.stringify({ username: "kishore", role: "superadmin", exp: Date.now() + 60000 })
).toString("base64url");
const tampered = `${fakePayload}.${oldSig}`;      // new payload, old signature
run("verify tampered", () => tokens.verifyToken(tampered));

// 5. EXPIRED token (exp in the past)
const expired = tokens.createToken({ username: "kishore", role: "admin", exp: Date.now() - 1000 });
run("verify expired ", () => tokens.verifyToken(expired));
