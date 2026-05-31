import apiClient from "./client";

export interface DeadlineData {
  start_date: string;
  end_date: string;
  days_remaining: number | null;
  status: "before" | "during" | "after";
  message: string;
}

export interface CompletenessData {
  is_complete: boolean;
  missing_fields: string[];
  message: string;
}

export interface ApplicationData {
  id: number;
  application_code: string;
  status: string;
  university_name: string;
  major_name: string;
  submitted_at: string | null;
  reject_reason: string | null;
  created_at: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface NotificationData {
  id: number;
  subject: string;
  content: string;
  type: string;
  status: string;
  created_at: string;
}

export interface DocumentData {
  id: number;
  document_type: string;
  file_name: string;
  file_url: string;
  file_type: string;
  uploaded_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export const dashboardApi = {
  getDeadline: () =>
    apiClient.get<ApiResponse<DeadlineData>>("/candidate/deadline"),

  getCompleteness: () =>
    apiClient.get<ApiResponse<CompletenessData>>(
      "/candidate/profile/completeness",
    ),

  getApplications: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<ApplicationData>>(
      "/candidate/applications",
      { params },
    ),

  getNotifications: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<NotificationData>>(
      "/candidate/notifications",
      { params },
    ),

  getDocuments: () =>
    apiClient.get<ApiResponse<DocumentData[]>>("/candidate/profile/documents"),

  getNotificationById: (id: number) =>
    apiClient.get<ApiResponse<NotificationData>>(
      `/candidate/notifications/${id}`,
    ),

  markNotificationRead: (id: number) =>
    apiClient.put<ApiResponse<null>>(`/candidate/notifications/${id}/read`),
};
