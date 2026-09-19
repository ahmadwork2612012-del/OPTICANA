import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

const JWT_EXPIRES_IN =
  "7d";

export function signToken(
  payload
) {
  return jwt.sign(
    payload,
    env.JWT_SECRET,
    {
      expiresIn:
        JWT_EXPIRES_IN,
    }
  );
}

export function verifyToken(
  token
) {
  return jwt.verify(
    token,
    env.JWT_SECRET
  );
}
