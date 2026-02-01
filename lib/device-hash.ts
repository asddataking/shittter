import { createHash } from "crypto";

const salt = process.env.DEVICE_HASH_SALT ?? "shittter-v1-salt";

export function getDeviceHash(ip: string, userAgent: string): string {
  return createHash("sha256")
    .update(ip + userAgent + salt)
    .digest("hex");
}
