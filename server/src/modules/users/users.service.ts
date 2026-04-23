import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";

export const userProfileSelect = {
  id: true,
  email: true,
  name: true,
  avatarUrl: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type UserProfile = Prisma.UserGetPayload<{ select: typeof userProfileSelect }>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findProfileById(id: bigint): Promise<UserProfile | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: userProfileSelect,
    });
  }

  async create(params: { email: string; name: string; passwordHash: string }) {
    return this.prisma.user.create({
      data: {
        email: params.email,
        name: params.name,
        passwordHash: params.passwordHash,
      },
      select: userProfileSelect,
    });
  }
}

