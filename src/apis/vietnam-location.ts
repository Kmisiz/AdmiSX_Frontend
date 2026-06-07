import apiClient from "./client";

export type LocationOption = {
  value: string;
  label: string;
  code: number;
};

export const vietnamLocationApi = {
  listProvinces: async (): Promise<{
    success: boolean;
    data: LocationOption[];
  }> => {
    const response = await apiClient.get<{
      success: boolean;
      data: LocationOption[];
    }>("/vietnam-locations/provinces");
    return response.data;
  },

  listWards: async (
    provinceCode: string,
  ): Promise<{ success: boolean; data: LocationOption[] }> => {
    const response = await apiClient.get<{
      success: boolean;
      data: LocationOption[];
    }>(`/vietnam-locations/provinces/${provinceCode}/wards`);
    return response.data;
  },
};
