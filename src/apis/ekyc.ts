import apiClient from "./client";

export type EkycStepStatus = "PENDING" | "VERIFIED" | "FAILED";
export type EkycOverallStatus =
  | "UNVERIFIED"
  | "PARTIAL"
  | "VERIFIED"
  | "FAILED";

export interface EkycStatusData {
  id: number;
  user_id: number;
  front_document_id: number | null;
  back_document_id: number | null;
  portrait_document_id: number | null;
  front_status: EkycStepStatus;
  back_status: EkycStepStatus;
  face_status: EkycStepStatus;
  overall_status: EkycOverallStatus;
  similarity: number | null;
  failure_reason: string | null;
  verified_at: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
}

export const defaultEkycStatus: EkycStatusData = {
  id: 0,
  user_id: 0,
  front_document_id: null,
  back_document_id: null,
  portrait_document_id: null,
  front_status: "PENDING",
  back_status: "PENDING",
  face_status: "PENDING",
  overall_status: "UNVERIFIED",
  similarity: null,
  failure_reason: null,
  verified_at: null,
};

export const ekycApi = {
  getStatus: () =>
    apiClient.get<ApiResponse<EkycStatusData>>("/candidate/ekyc/status"),

  verifyFront: (documentId: number) =>
    apiClient.post<ApiResponse<EkycStatusData>>("/candidate/ekyc/front", {
      document_id: documentId,
    }),

  verifyBack: (documentId: number) =>
    apiClient.post<ApiResponse<EkycStatusData>>("/candidate/ekyc/back", {
      document_id: documentId,
    }),

  verifyPortrait: (frontDocumentId: number, portraitDocumentId: number) =>
    apiClient.post<ApiResponse<EkycStatusData>>("/candidate/ekyc/verify", {
      front_document_id: frontDocumentId,
      portrait_document_id: portraitDocumentId,
    }),
};
