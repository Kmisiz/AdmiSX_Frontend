import apiClient from "./client";

export interface University {
  id: string;
  code: string;
  name: string;
  email?: string;
  status?: string;
}

export interface Major {
  id: string;
  code: string;
  name: string;
  min_score: number | null;
  status?: string;
}

export interface Combination {
  id: string;
  code: string;
  subject_1: string;
  subject_2: string;
  subject_3: string;
}

export interface ApplicationData {
  id: number;
  application_code: string;
  status: string;
  university_name: string;
  major_name: string;
  combination_code: string;
  subject_1_score: number | null;
  subject_2_score: number | null;
  subject_3_score: number | null;
  created_at: string;
  submitted_at: string | null;
}

export interface DocumentData {
  id: number;
  document_type: string;
  file_name: string;
  display_name?: string;
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
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const admissionsApi = {
  getUniversities: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<University[]>>("/universities", { params }),

  getMajors: (
    universityCode: string,
    params?: { page?: number; limit?: number },
  ) =>
    apiClient.get<ApiResponse<Major[]>>(
      `/universities/${universityCode}/majors`,
      { params },
    ),

  getCombinations: (
    universityCode: string,
    majorCode: string,
    params?: { page?: number; limit?: number },
  ) =>
    apiClient.get<ApiResponse<Combination[]>>(
      `/universities/${universityCode}/majors/${majorCode}/combinations`,
      { params },
    ),

  createApplication: (data: {
    university_id: string;
    major_id: string;
    combination_id: string;
    subject_1_score?: number | null;
    subject_2_score?: number | null;
    subject_3_score?: number | null;
  }) =>
    apiClient.post<ApiResponse<ApplicationData>>(
      "/candidate/applications",
      data,
    ),

  submitApplication: (id: number) =>
    apiClient.post<ApiResponse<ApplicationData>>(
      `/candidate/applications/${id}/submit`,
    ),

  getApplications: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<ApplicationData>>(
      "/candidate/applications",
      { params },
    ),

  getDocuments: () =>
    apiClient.get<ApiResponse<DocumentData[]>>("/candidate/profile/documents"),

  uploadDocument: (
    file: File,
    documentType: string,
    displayName?: string,
    onProgress?: (pct: number) => void,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", documentType);
    if (displayName) {
      formData.append("display_name", displayName);
    }
    return apiClient.post<ApiResponse<DocumentData>>(
      "/candidate/profile/documents",
      formData,
      onProgress ? { onUploadProgress: (e) => { if (e.total) onProgress(Math.round((e.loaded / e.total) * 100)); } } : undefined,
    );
  },

  deleteDocument: (id: number) =>
    apiClient.delete<ApiResponse<null>>(`/candidate/profile/documents/${id}`),

  deleteExamScores: () =>
    apiClient.delete<ApiResponse<unknown>>(
      "/candidate/profile/exam-scores-by-group",
    ),

  uploadExamScores: (
    scores: Record<string, number>,
    examCertificate?: File,
    foreignLanguage?: { language_code: string },
    onProgress?: (pct: number) => void,
  ) => {
    const formData = new FormData();
    formData.append("scores", JSON.stringify(scores));
    if (examCertificate) {
      formData.append("exam_certificate", examCertificate);
    }
    if (foreignLanguage) {
      formData.append("foreign_language", JSON.stringify(foreignLanguage));
    }
    return apiClient.put<ApiResponse<unknown>>(
      "/candidate/profile/exam-scores-by-group",
      formData,
      onProgress ? { onUploadProgress: (e) => { if (e.total) onProgress(Math.round((e.loaded / e.total) * 100)); } } : undefined,
    );
  },
};
