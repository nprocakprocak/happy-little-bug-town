import { apiFetch } from "./client";

export interface UserDto {
  id: string;
  name?: string;
  email?: string;
}

export function fetchUser(id: string): Promise<UserDto> {
  return apiFetch<UserDto>(`/api/users/${id}`);
}

export function updateUser(id: string): Promise<UserDto> {
  return apiFetch<UserDto>(`/api/users/${id}`, {
    method: "PUT",
  });
}
