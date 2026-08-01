// Reference — JWT simulation. Study each method with the notes below.

class InvalidSignature extends Error {
  constructor(message) { super(message); this.name = "InvalidSignature"; }
}
class TokenExpired extends Error {
  constructor(message) { super(message); this.name = "TokenExpired"; }
}

class TokenService {
  #secret = "mysecret";

  // a deterministic fake hash (real code: HMAC-SHA256 via a crypto lib)
  #fakeHash(str) {
    let h = 0;
    for (const c of str) h = h + c.charCodeAt(0) * 31;
    return `sig${h}`;
  }

  // sign header helper: base64 the JSON, then hash (payload + secret) → signature
  #sign(encodedPayload) {
    return this.#fakeHash(encodedPayload + this.#secret);
  }

  // ── CREATE: payload object → "P.S" token ──────────────────────────────────
  createToken(payload) {
    const json = JSON.stringify(payload);                       // object → text
    const encodedPayload = Buffer.from(json).toString("base64url"); // P (readable)
    const signature = this.#sign(encodedPayload);               // S = hash(P + secret)
    return `${encodedPayload}.${signature}`;                    // token = P.S
  }

  // ── DECODE: read the payload WITHOUT verifying (proves it's readable) ──────
  decode(token) {
    const [encodedPayload] = token.split(".");                  // take P (left of dot)
    const json = Buffer.from(encodedPayload, "base64url").toString(); // base64 → text
    return JSON.parse(json);                                    // text → object
  }

  // ── VERIFY: check signature, then expiry, then trust the claims ───────────
  verifyToken(token) {
    const [encodedPayload, signature] = token.split(".");       // P and S

    // 1) recompute the signature over the RECEIVED payload, compare
    const expected = this.#sign(encodedPayload);
    if (expected !== signature) throw new InvalidSignature("invalid signature");

    // 2) decode the payload and check expiry
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString());
    if (payload.exp < Date.now()) throw new TokenExpired("token expired");

    // 3) all good → return the trusted claims
    return payload;
  }
}

module.exports = { TokenService, InvalidSignature, TokenExpired };
