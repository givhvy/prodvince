import bcrypt from "bcryptjs";
import { createUser, getAuthUserByEmail } from "@/lib/catalog";
import type { User, UserRole } from "@/types";

const DEMO_EMAILS = new Set([
  "buyer@demo.local",
  "studio@velta.local",
  "admin@velta.local",
  "blackrose@velta.local",
]);

export async function authenticate(email: string, password: string | undefined): Promise<User | null> {
  const record = await getAuthUserByEmail(email.trim());
  if (!record) return null;

  if (password) {
    const matches = await bcrypt.compare(password, record.passwordHash);
    return matches ? record.user : null;
  }

  if (DEMO_EMAILS.has(record.user.email.toLowerCase())) return record.user;
  return null;
}

export async function registerAccount(input: {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}) {
  const existing = await getAuthUserByEmail(input.email);
  if (existing) return { error: "An account with that email already exists" as const };

  const passwordHash = await bcrypt.hash(input.password, 10);
  const sellerSlug =
    input.role === "seller"
      ? input.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || null
      : null;

  const user = await createUser({
    email: input.email,
    name: input.name,
    passwordHash,
    role: input.role,
    sellerSlug,
  });

  return { user };
}
