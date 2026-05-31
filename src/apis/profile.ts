import apiClient from "./client";

export interface CandidateProfileData {
  user: {
    id: number;
    email: string;
    role: "CANDIDATE" | "ADMIN";
    status: "ACTIVE" | "LOCKED" | "PENDING";
    last_login_at: string | null;
  };
  candidate_profile: {
    citizen_id: number;
    full_name: string;
    phone: string | null;
    date_of_birth: string | null;
    gender: "MALE" | "FEMALE" | "OTHER" | null;
    citizen_issue_date: string | null;
    citizen_issue_place: string | null;
    religion: string | null;
    ethnic: string | null;
    nation: string | null;
    province: string | null;
    ward: string | null;
    address: string | null;
  };
}

export interface AcademicRecordData {
  academic_record: {
    id: number | null;
    candidate_id: number;
    graduation_year: number | null;
    priority_score: number;
    exam_scores: Array<{
      subject_code: string;
      subject_name: string;
      score: number;
    }>;
  } | null;
  academic_progress: {
    grade_10: { school_name: string | null; avg_score: number | null };
    grade_11: { school_name: string | null; avg_score: number | null };
    grade_12: { school_name: string | null; avg_score: number | null };
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const profileApi = {
  getProfile: () =>
    apiClient.get<ApiResponse<CandidateProfileData>>("/candidate/profile"),

  updateProfile: (data: Partial<CandidateProfileData["candidate_profile"]>) =>
    apiClient.put<ApiResponse<CandidateProfileData>>(
      "/candidate/profile",
      data,
    ),

  getAcademicRecord: () =>
    apiClient.get<ApiResponse<AcademicRecordData>>(
      "/candidate/profile/academic-record",
    ),

  upsertAcademicRecord: (data: {
    graduation_year?: number | null;
    science_group?: "NATURAL" | "SOCIAL" | null;
    priority_score?: number | null;
  }) =>
    apiClient.put<ApiResponse<AcademicRecordData>>(
      "/candidate/profile/academic-record",
      data,
    ),

  changePassword: (data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }) =>
    apiClient.put<{ success: boolean; message: string }>(
      "/auth/change-password",
      data,
    ),

  upsertAcademicProgress: (data: {
    grade_10?: { school_name?: string | null; avg_score?: number | null };
    grade_11?: { school_name?: string | null; avg_score?: number | null };
    grade_12?: { school_name?: string | null; avg_score?: number | null };
  }) =>
    apiClient.put<ApiResponse<AcademicRecordData>>(
      "/candidate/profile/academic-progress",
      data,
    ),
};
