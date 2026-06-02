import apiClient from "./client";
import type { User } from "../types/auth";

interface ProfileResponse {
  success: boolean;
  data: User;
  message?: string;
}

interface ActionResponse {
  success: boolean;
  message: string;
}

export const authApi = {
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await apiClient.get<ProfileResponse>("/auth/profile");
    return response.data;
  },

  logout: async (): Promise<ActionResponse> => {
    const response = await apiClient.post<ActionResponse>("/auth/logout");
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<ProfileResponse> => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await apiClient.post<ProfileResponse>(
      "/users/me/avatar",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  deleteAvatar: async (): Promise<ProfileResponse> => {
    const response = await apiClient.delete<ProfileResponse>("/users/me/avatar");
    return response.data;
  },
};
