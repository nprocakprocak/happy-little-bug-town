import { User } from "../prisma/prisma/client.js";
import { UserDto } from "../types/userDto.js";

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    name: user.name ?? undefined,
    email: user.email ?? undefined,
    isLinked: user.googleSub !== null,
  };
}
