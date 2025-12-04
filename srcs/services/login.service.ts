// backend/src/User/login/login.service.ts
import * as db from "@config/database/db";
import type { User } from "@config/database/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRATION = "1h";

export async function verifyPassword(
  plainPassword: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

export function generateAccessToken(user: User): string {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );
}
