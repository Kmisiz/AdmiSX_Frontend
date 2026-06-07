import apiClient from "./client";

export type NationalityOption = {
  value: string;
  label: string;
};

export const nationalityApi = {
  list: async (): Promise<{ success: boolean; data: NationalityOption[] }> => {
    const response = await apiClient.get<{
      success: boolean;
      data: NationalityOption[];
    }>("/nationalities");
    return response.data;
  },
};
