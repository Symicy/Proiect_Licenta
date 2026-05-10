import type { CustomerType, Role, User } from "@prisma/client";

import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/security/password";

export type PublicUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  customerType: CustomerType | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Role;
  customerType?: CustomerType | null;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email: normalizeEmail(email),
    },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function createUser(input: CreateUserInput) {
  const passwordHash = await hashPassword(input.password);
  const role = input.role ?? "CUSTOMER";
  const customerType = role === "CUSTOMER" ? input.customerType ?? "INDIVIDUAL" : null;

  return prisma.user.create({
    data: {
      email: normalizeEmail(input.email),
      passwordHash,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      role,
      customerType,
    },
  });
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    customerType: user.customerType,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
