import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const generateReferralCode = async (): Promise<string> => {
  let code: string;
  let isUnique = false;

  while (!isUnique) {
    // Generate 8-character alphanumeric code
    code = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Check if code already exists
    const existingUser = await prisma.user.findUnique({
      where: { referralCode: code },
    });

    if (!existingUser) {
      isUnique = true;
    }
  }

  return code!;
};
