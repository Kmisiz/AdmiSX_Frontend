import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Toast from "../components/common/Toast";
import {
  profileApi,
  type CandidateProfileData,
  type AcademicRecordData,
} from "../apis/profile";
import ConfirmDialog from "../components/common/ConfirmDialog";
import DocumentViewer from "../components/common/DocumentViewer";
import { admissionsApi, type DocumentData } from "../apis/admissions";
import { authApi } from "../apis/auth";
import { useAuthStore } from "../store/auth";

type ActiveTab = "personal" | "academic" | "security";

const TAB_CONFIG: { key: ActiveTab; label: string; icon: string }[] = [
  { key: "personal", label: "Thông tin cá nhân", icon: "person" },
  { key: "academic", label: "Hồ sơ học tập", icon: "school" },
  { key: "security", label: "Bảo mật", icon: "shield" },
];

const GENDER_OPTIONS = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
];

const PROFILE_STYLES = `
input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear,
input[type="password"]::-webkit-credentials-auto-fill-button,
input[type="password"]::-webkit-contacts-auto-fill-button {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  pointer-events: none !important;
}
`;

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("personal");
  const [profile, setProfile] = useState<CandidateProfileData | null>(null);
  const [academic, setAcademic] = useState<AcademicRecordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    province: "",
    address: "",
    ethnic: "",
    religion: "",
    nation: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [academicForm, setAcademicForm] = useState({
    graduation_year: "",
    grade_10_school: "",
    grade_10_score: "",
    grade_11_school: "",
    grade_11_score: "",
    grade_12_school: "",
    grade_12_score: "",
  });

  const [examScores, setExamScores] = useState<
    { subject_code: string; subject_name: string; score: string }[]
  >([
    { subject_code: "TOAN", subject_name: "Toán", score: "" },
    { subject_code: "VAN", subject_name: "Ngữ văn", score: "" },
  ]);
  const [selectedOptional, setSelectedOptional] = useState<string[]>([]);
  const [foreignLanguage, setForeignLanguage] = useState("");
  const [examCertificate, setExamCertificate] = useState<File | null>(null);
  const [uploadingScores, setUploadingScores] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [examMode, setExamMode] = useState<"view" | "edit">("view");
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [certEditing, setCertEditing] = useState(false);
  const [newCertFile, setNewCertFile] = useState<File | null>(null);
  const [viewCertDoc, setViewCertDoc] = useState<DocumentData | null>(null);
  const [deleteCertTarget, setDeleteCertTarget] = useState<DocumentData | null>(
    null,
  );

  const OPTIONAL_SUBJECTS = useMemo(
    () => [
      { code: "LY", name: "Vật lý" },
      { code: "HOA", name: "Hóa học" },
      { code: "SINH", name: "Sinh học" },
      { code: "SU", name: "Lịch sử" },
      { code: "DIA", name: "Địa lý" },
      { code: "GDKTPL", name: "GDKT và PL" },
      { code: "TINHOC", name: "Tin học" },
      { code: "CONGNGHE", name: "Công nghệ" },
      { code: "NGOAINGU", name: "Ngoại ngữ" },
    ],
    [],
  );

  const FOREIGN_LANGUAGES = [
    { code: "ANH", name: "Tiếng Anh" },
    { code: "HAN", name: "Tiếng Hàn" },
    { code: "NHAT", name: "Tiếng Nhật" },
    { code: "PHAP", name: "Tiếng Pháp" },
    { code: "DUC", name: "Tiếng Đức" },
    { code: "TRUNG", name: "Tiếng Trung" },
    { code: "NGA", name: "Tiếng Nga" },
  ];

  const [academicFieldErrors, setAcademicFieldErrors] = useState<
    Record<string, string>
  >({});

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { user, setUser } = useAuthStore();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Vui lòng chọn file ảnh" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Ảnh tối đa 5MB" });
      return;
    }
    setAvatarBusy(true);
    try {
      const res = await authApi.uploadAvatar(file);
      if (res.success && res.data) {
        setUser(res.data);
        setMessage({ type: "success", text: "Cập nhật avatar thành công!" });
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setMessage({
        type: "error",
        text:
          apiErr?.response?.data?.message ||
          "Upload thất bại. Vui lòng thử lại.",
      });
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setAvatarBusy(true);
    try {
      const res = await authApi.deleteAvatar();
      if (res.success && res.data) {
        setUser(res.data);
        setMessage({ type: "success", text: "Đã xoá avatar" });
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setMessage({
        type: "error",
        text:
          apiErr?.response?.data?.message || "Xoá thất bại. Vui lòng thử lại.",
      });
    } finally {
      setAvatarBusy(false);
    }
  };

  const dismissMessage = useCallback(() => setMessage(null), []);

  const passwordChecks = [
    {
      key: "length",
      label: "Ít nhất 8 ký tự",
      test: (v: string) => v.length >= 8,
    },
    {
      key: "uppercase",
      label: "Chứa chữ hoa (A-Z)",
      test: (v: string) => /[A-Z]/.test(v),
    },
    {
      key: "lowercase",
      label: "Chứa chữ thường (a-z)",
      test: (v: string) => /[a-z]/.test(v),
    },
    {
      key: "number",
      label: "Chứa chữ số (0-9)",
      test: (v: string) => /\d/.test(v),
    },
    {
      key: "special",
      label: "Chứa ký tự đặc biệt (!@#...)",
      test: (v: string) => /[^a-zA-Z0-9]/.test(v),
    },
  ];

  const validatePasswordField = (value: string) => {
    const allPass = passwordChecks.every((c) => c.test(value));
    setPasswordErrors((prev) => ({
      ...prev,
      new_password:
        value && !allPass ? "Mật khẩu chưa đáp ứng đủ điều kiện" : "",
    }));
    if (
      passwordForm.confirm_password &&
      value !== passwordForm.confirm_password
    ) {
      setPasswordErrors((prev) => ({
        ...prev,
        confirm_password: "Mật khẩu xác nhận không khớp",
      }));
    } else {
      setPasswordErrors((prev) => ({ ...prev, confirm_password: "" }));
    }
  };

  const handleChangePassword = async () => {
    const newErrors = {
      current_password: "",
      new_password: "",
      confirm_password: "",
    };

    if (!passwordForm.current_password) {
      newErrors.current_password = "Vui lòng nhập mật khẩu hiện tại";
    }
    if (!passwordForm.new_password) {
      newErrors.new_password = "Vui lòng nhập mật khẩu mới";
    } else {
      const allPass = passwordChecks.every((c) =>
        c.test(passwordForm.new_password),
      );
      if (!allPass)
        newErrors.new_password = "Mật khẩu chưa đáp ứng đủ điều kiện";
    }
    if (!passwordForm.confirm_password) {
      newErrors.confirm_password = "Vui lòng xác nhận mật khẩu mới";
    } else if (passwordForm.new_password !== passwordForm.confirm_password) {
      newErrors.confirm_password = "Mật khẩu xác nhận không khớp";
    }

    setPasswordErrors(newErrors);

    if (
      newErrors.current_password ||
      newErrors.new_password ||
      newErrors.confirm_password
    ) {
      setMessage({
        type: "error",
        text: "Vui lòng kiểm tra lại thông tin mật khẩu.",
      });
      return;
    }

    setChangingPassword(true);
    setMessage(null);
    try {
      const res = await profileApi.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        confirm_password: passwordForm.confirm_password,
      });
      setMessage({
        type: "success",
        text: res.data.message || "Đổi mật khẩu thành công!",
      });
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setPasswordErrors({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setMessage({
        type: "error",
        text:
          apiErr?.response?.data?.message ||
          "Cập nhật thất bại. Vui lòng thử lại.",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleOptionalSubject = (code: string) => {
    setSelectedOptional((prev) => {
      const newSelected = prev.includes(code)
        ? prev.filter((c) => c !== code)
        : prev.length < 2
          ? [...prev, code]
          : prev;

      setExamScores((prevScores) => {
        const base = [
          prevScores.find((s) => s.subject_code === "TOAN") || {
            subject_code: "TOAN",
            subject_name: "Toán",
            score: "",
          },
          prevScores.find((s) => s.subject_code === "VAN") || {
            subject_code: "VAN",
            subject_name: "Ngữ văn",
            score: "",
          },
        ];
        for (const c of newSelected) {
          const def = OPTIONAL_SUBJECTS.find((o) => o.code === c);
          if (def) {
            const existing = prevScores.find((s) => s.subject_code === c);
            base.push({
              subject_code: c,
              subject_name: def.name,
              score: existing?.score || "",
            });
          }
        }
        return base;
      });

      if (code === "NGOAINGU" && !newSelected.includes("NGOAINGU")) {
        setForeignLanguage("");
      }

      return newSelected;
    });
  };

  const updateExamScore = (idx: number, val: string) => {
    if (
      val !== "" &&
      (isNaN(Number(val)) || Number(val) < 0 || Number(val) > 10)
    )
      return;
    setExamScores((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, score: val } : s)),
    );
  };

  const handleUploadExamScores = async () => {
    // Validate: exactly 2 optional subjects
    if (selectedOptional.length !== 2) {
      setMessage({
        type: "error",
        text: "Vui lòng chọn đúng 2 môn tự chọn.",
      });
      return;
    }

    // Validate: all 4 scores filled
    const scoreMap: Record<string, number> = {};
    for (const s of examScores) {
      if (s.score === "" || isNaN(Number(s.score))) {
        setMessage({
          type: "error",
          text: `Vui lòng nhập điểm môn ${s.subject_name}.`,
        });
        return;
      }
      scoreMap[s.subject_code] = Number(s.score);
    }

    // Validate: foreign language if NGOAINGU
    if (selectedOptional.includes("NGOAINGU") && !foreignLanguage) {
      setMessage({
        type: "error",
        text: "Vui lòng chọn ngoại ngữ thi.",
      });
      return;
    }

    if (!examCertificate) {
      setMessage({
        type: "error",
        text: "Vui lòng tải lên giấy chứng nhận kết quả thi.",
      });
      return;
    }

    setUploadingScores(true);
    setUploadProgress(0);
    setMessage(null);
    try {
      const hasNgoaiNgu = selectedOptional.includes("NGOAINGU");
      await admissionsApi.uploadExamScores(
        scoreMap,
        examCertificate ?? undefined,
        hasNgoaiNgu ? { language_code: foreignLanguage } : undefined,
        setUploadProgress,
      );
      // Refresh academic record + documents
      const [academicRes, docsRes] = await Promise.all([
        profileApi.getAcademicRecord(),
        admissionsApi.getDocuments(),
      ]);
      setAcademic(academicRes.data.data);
      setDocuments(docsRes.data.data || []);
      setMessage({
        type: "success",
        text: "Cập nhật điểm thi thành công!",
      });
      setExamCertificate(null);
      setExamMode("view");
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setMessage({
        type: "error",
        text:
          apiErr?.response?.data?.message ||
          "Cập nhật điểm thi thất bại. Vui lòng thử lại.",
      });
    } finally {
      setUploadingScores(false);
    }
  };

  const handleReplaceCertificate = async (certDocId: number) => {
    if (!newCertFile) return;
    setUploadingScores(true);
    setUploadProgress(0);
    try {
      await admissionsApi.deleteDocument(certDocId);
      await admissionsApi.uploadDocument(
        newCertFile,
        "EXAM_CERTIFICATE",
        undefined,
        setUploadProgress,
      );
      const docsRes = await admissionsApi.getDocuments();
      setDocuments(docsRes.data.data || []);
      setCertEditing(false);
      setNewCertFile(null);
      setMessage({
        type: "success",
        text: "Cập nhật giấy chứng nhận thành công!",
      });
    } catch {
      setMessage({ type: "error", text: "Cập nhật giấy chứng nhận thất bại." });
    } finally {
      setUploadingScores(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, academicRes, docsRes] = await Promise.all([
          profileApi.getProfile(),
          profileApi.getAcademicRecord(),
          admissionsApi.getDocuments().catch(() => null),
        ]);

        if (docsRes?.data?.data) {
          setDocuments(docsRes.data.data);
        }
        const p = profileRes.data.data;
        const a = academicRes.data.data;
        setProfile(p);
        setAcademic(a);

        const cp = p.candidate_profile;
        setFormData({
          full_name: cp.full_name || "",
          phone: cp.phone || "",
          date_of_birth: cp.date_of_birth
            ? new Date(cp.date_of_birth).toLocaleDateString("en-CA")
            : "",
          gender: cp.gender || "",
          province: cp.province || "",
          address: cp.address || "",
          ethnic: cp.ethnic || "",
          religion: cp.religion || "",
          nation: cp.nation || "",
        });

        const ar = a.academic_record;
        const ap = a.academic_progress;
        setAcademicForm({
          graduation_year: ar?.graduation_year?.toString() || "",
          grade_10_school: ap.grade_10?.school_name || "",
          grade_10_score: ap.grade_10?.avg_score?.toString() || "",
          grade_11_school: ap.grade_11?.school_name || "",
          grade_11_score: ap.grade_11?.avg_score?.toString() || "",
          grade_12_school: ap.grade_12?.school_name || "",
          grade_12_score: ap.grade_12?.avg_score?.toString() || "",
        });

        // Initialize exam scores based on existing data
        if (ar?.exam_scores && ar.exam_scores.length > 0) {
          const toanScore = ar.exam_scores.find(
            (s) => s.subject_code === "TOAN",
          );
          const vanScore = ar.exam_scores.find((s) => s.subject_code === "VAN");
          const optionalScores = ar.exam_scores.filter(
            (s) => s.subject_code !== "TOAN" && s.subject_code !== "VAN",
          );

          const newScores = [
            {
              subject_code: "TOAN",
              subject_name: "Toán",
              score: toanScore?.score?.toString() || "",
            },
            {
              subject_code: "VAN",
              subject_name: "Ngữ văn",
              score: vanScore?.score?.toString() || "",
            },
          ];

          for (const os of optionalScores) {
            const optDef = OPTIONAL_SUBJECTS.find(
              (o) => o.code === os.subject_code,
            );
            if (optDef) {
              newScores.push({
                subject_code: os.subject_code,
                subject_name: optDef.name,
                score: os.score.toString(),
              });
            }
          }

          setExamScores(newScores);
          setSelectedOptional(optionalScores.map((s) => s.subject_code));

          if (optionalScores.some((s) => s.subject_code === "NGOAINGU")) {
            setForeignLanguage(ar.foreign_language?.language_code || "");
          }
        }
      } catch {
        setMessage({ type: "error", text: "Không thể tải thông tin hồ sơ." });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [OPTIONAL_SUBJECTS]);

  const extractFieldErrors = (err: unknown): Record<string, string> => {
    const data = (err as { response?: { data?: Record<string, unknown> } })
      ?.response?.data;
    if (!data) return {};
    if (typeof data.errors === "object" && data.errors !== null) {
      if (Array.isArray(data.errors)) {
        const map: Record<string, string> = {};
        for (const e of data.errors) {
          if (!e || typeof e !== "object") continue;
          const entry = e as Record<string, unknown>;
          // express-validator: { path, msg }
          if (entry.path && entry.msg) {
            map[entry.path as string] = entry.msg as string;
          }
          // class-validator (NestJS): { property, constraints }
          else if (entry.property && entry.constraints) {
            const cons = entry.constraints as Record<string, string>;
            map[entry.property as string] = Object.values(cons)[0] || "Invalid";
          }
          // generic: { field, message }
          else if (entry.field && entry.message) {
            map[entry.field as string] = entry.message as string;
          }
        }
        return map;
      }
      return data.errors as Record<string, string>;
    }
    if (typeof data.fields === "object" && data.fields !== null) {
      return data.fields as Record<string, string>;
    }
    if (typeof data.error === "string") {
      return { _general: data.error as string };
    }
    return {};
  };

  const handleSaveProfile = async () => {
    setFieldErrors({});
    if (!formData.full_name.trim()) {
      setFieldErrors({ full_name: "Họ và tên không được để trống." });
      setMessage({ type: "error", text: "Vui lòng kiểm tra lại thông tin." });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const payload: Record<string, unknown> = {
        full_name: formData.full_name.trim(),
        phone: formData.phone,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        province: formData.province,
        address: formData.address,
        ethnic: formData.ethnic,
        religion: formData.religion,
        nation: formData.nation,
      };
      const res = await profileApi.updateProfile(payload as never);
      setProfile(res.data.data);
      useAuthStore.getState().setUser({
        ...useAuthStore.getState().user!,
        full_name: formData.full_name.trim(),
      });
      setMessage({ type: "success", text: "Cập nhật thông tin thành công!" });
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      const errData = apiErr?.response?.data as
        | Record<string, unknown>
        | undefined;
      console.error("Profile save error:", errData);
      if (errData?.errors) console.error("Errors detail:", errData.errors);
      const fe = extractFieldErrors(err);
      setFieldErrors(fe);
      setMessage({
        type: "error",
        text:
          apiErr?.response?.data?.message ||
          "Cập nhật thất bại. Vui lòng thử lại.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAcademic = async () => {
    setAcademicFieldErrors({});
    setSaving(true);
    setMessage(null);
    try {
      const progressPayload: {
        grade_10?: { school_name?: string; avg_score?: number };
        grade_11?: { school_name?: string; avg_score?: number };
        grade_12?: { school_name?: string; avg_score?: number };
      } = {};

      const g10: { school_name?: string; avg_score?: number } = {};
      if (academicForm.grade_10_school)
        g10.school_name = academicForm.grade_10_school;
      if (academicForm.grade_10_score)
        g10.avg_score = parseFloat(academicForm.grade_10_score);
      progressPayload.grade_10 = Object.keys(g10).length ? g10 : undefined;

      const g11: { school_name?: string; avg_score?: number } = {};
      if (academicForm.grade_11_school)
        g11.school_name = academicForm.grade_11_school;
      if (academicForm.grade_11_score)
        g11.avg_score = parseFloat(academicForm.grade_11_score);
      progressPayload.grade_11 = Object.keys(g11).length ? g11 : undefined;

      const g12: { school_name?: string; avg_score?: number } = {};
      if (academicForm.grade_12_school)
        g12.school_name = academicForm.grade_12_school;
      if (academicForm.grade_12_score)
        g12.avg_score = parseFloat(academicForm.grade_12_score);
      progressPayload.grade_12 = Object.keys(g12).length ? g12 : undefined;
      if (academicForm.grade_11_school || academicForm.grade_11_score) {
        const g11: Record<string, unknown> = {};
        if (academicForm.grade_11_school)
          g11.school_name = academicForm.grade_11_school;
        if (academicForm.grade_11_score)
          g11.avg_score = parseFloat(academicForm.grade_11_score);
        progressPayload.grade_11 = g11;
      }
      if (academicForm.grade_12_school || academicForm.grade_12_score) {
        const g12: Record<string, unknown> = {};
        if (academicForm.grade_12_school)
          g12.school_name = academicForm.grade_12_school;
        if (academicForm.grade_12_score)
          g12.avg_score = parseFloat(academicForm.grade_12_score);
        progressPayload.grade_12 = g12;
      }
      await profileApi.upsertAcademicProgress(progressPayload as never);

      const academicRes = await profileApi.getAcademicRecord();
      setAcademic(academicRes.data.data);
      setMessage({
        type: "success",
        text: "Cập nhật hồ sơ học tập thành công!",
      });
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      console.error("Academic save error:", apiErr?.response?.data || apiErr);
      const fe = extractFieldErrors(err);
      setAcademicFieldErrors(fe);
      setMessage({
        type: "error",
        text:
          apiErr?.response?.data?.message ||
          "Cập nhật thất bại. Vui lòng thử lại.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#F5F7FB]">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-[#032D60] animate-spin text-[40px]">
            progress_activity
          </span>
          <p className="text-[#667085] text-sm">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{PROFILE_STYLES}</style>
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-9 py-8 bg-[#F5F7FB]">
        <div className="mb-6">
          <h1 className="text-[32px] font-bold text-[#344054]">
            Hồ sơ của tôi
          </h1>
          <p className="text-[#667085] text-sm mt-1">
            Quản lý thông tin cá nhân và hồ sơ học tập
          </p>
        </div>

        <Toast message={message} onDismiss={dismissMessage} />

        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-[#E4E7EC] overflow-hidden sticky top-24">
              <div className="p-5 border-b border-[#E4E7EC]">
                <div className="flex items-center gap-3">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#032D60] flex items-center justify-center text-white font-bold">
                      {profile?.candidate_profile?.full_name?.charAt(0) || "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#344054] truncate">
                      {profile?.candidate_profile?.full_name || "Thí sinh"}
                    </p>
                    <p className="text-[11px] text-[#667085] truncate">
                      {profile?.user?.email}
                    </p>
                  </div>
                </div>
              </div>
              <nav className="flex flex-col">
                {TAB_CONFIG.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-3 px-5 py-3 text-left transition-all text-sm ${
                      activeTab === tab.key
                        ? "bg-[#032D60]/10 border-l-4 border-[#032D60] text-[#032D60] font-semibold"
                        : "text-[#667085] hover:bg-[#F9FAFB] border-l-4 border-transparent"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {tab.icon}
                    </span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <div className="flex-1 space-y-6">
            {activeTab === "personal" && (
              <section className="bg-white rounded-2xl border border-[#E4E7EC] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E4E7EC] bg-[#F4F6F9] flex justify-between items-center">
                  <h3 className="text-lg font-bold text-[#344054]">
                    Thông tin cá nhân
                  </h3>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-[#032D60] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#021a40] transition-all active:scale-95 disabled:opacity-50"
                  >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="relative group">
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={avatarBusy}
                        title={
                          user?.avatar_url ? "Đổi avatar" : "Tải avatar lên"
                        }
                        className="relative w-24 h-24 rounded-full border-4 border-[#E4E7EC] overflow-hidden bg-[#032D60] flex items-center justify-center disabled:opacity-60 cursor-pointer"
                      >
                        {user?.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt="avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-3xl font-bold">
                            {profile?.candidate_profile?.full_name?.charAt(0) ||
                              "?"}
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-white text-2xl">
                            photo_camera
                          </span>
                        </div>
                        {avatarBusy && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-2xl animate-spin">
                              progress_activity
                            </span>
                          </div>
                        )}
                      </button>
                      {user?.avatar_url && (
                        <button
                          type="button"
                          onClick={handleDeleteAvatar}
                          disabled={avatarBusy}
                          title="Xoá avatar"
                          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#EF4444] text-white flex items-center justify-center shadow-md hover:bg-[#DC2626] transition-colors disabled:opacity-60"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            delete
                          </span>
                        </button>
                      )}
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#344054]">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          value={formData.full_name}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              full_name: e.target.value,
                            }));
                            if (fieldErrors.full_name)
                              setFieldErrors((prev) => ({
                                ...prev,
                                full_name: "",
                              }));
                          }}
                          className={`h-11 px-3 border rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none transition-all text-sm ${fieldErrors.full_name ? "border-[#EF4444]" : "border-[#D0D5DD]"}`}
                        />
                        {fieldErrors.full_name && (
                          <p className="text-[11px] text-[#EF4444]">
                            {fieldErrors.full_name}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#344054]">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profile?.user?.email || ""}
                          disabled
                          className="h-11 px-3 border border-[#D0D5DD] rounded-lg bg-[#F4F6F9] text-[#667085] cursor-not-allowed text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#344054]">
                          Số điện thoại{" "}
                          <span className="text-[#EF4444]">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              phone: e.target.value.replace(/\D/g, ""),
                            }));
                            if (fieldErrors.phone)
                              setFieldErrors((prev) => ({
                                ...prev,
                                phone: "",
                              }));
                          }}
                          className={`h-11 px-3 border rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none transition-all text-sm ${fieldErrors.phone ? "border-[#EF4444]" : "border-[#D0D5DD]"}`}
                        />
                        {fieldErrors.phone && (
                          <p className="text-[11px] text-[#EF4444]">
                            {fieldErrors.phone}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#344054]">
                          Ngày sinh <span className="text-[#EF4444]">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.date_of_birth}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              date_of_birth: e.target.value,
                            }));
                            if (fieldErrors.date_of_birth)
                              setFieldErrors((prev) => ({
                                ...prev,
                                date_of_birth: "",
                              }));
                          }}
                          className={`h-11 px-3 border rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none transition-all text-sm ${fieldErrors.date_of_birth ? "border-[#EF4444]" : "border-[#D0D5DD]"}`}
                        />
                        {fieldErrors.date_of_birth && (
                          <p className="text-[11px] text-[#EF4444]">
                            {fieldErrors.date_of_birth}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#344054]">
                          Giới tính <span className="text-[#EF4444]">*</span>
                        </label>
                        <select
                          value={formData.gender}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              gender: e.target.value,
                            }));
                            if (fieldErrors.gender)
                              setFieldErrors((prev) => ({
                                ...prev,
                                gender: "",
                              }));
                          }}
                          className={`h-11 px-3 border rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none transition-all text-sm bg-white ${fieldErrors.gender ? "border-[#EF4444]" : "border-[#D0D5DD]"}`}
                        >
                          <option value="">Chọn giới tính</option>
                          {GENDER_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {fieldErrors.gender && (
                          <p className="text-[11px] text-[#EF4444]">
                            {fieldErrors.gender}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#344054]">
                          Dân tộc <span className="text-[#EF4444]">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.ethnic}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              ethnic: e.target.value,
                            }));
                            if (fieldErrors.ethnic)
                              setFieldErrors((prev) => ({
                                ...prev,
                                ethnic: "",
                              }));
                          }}
                          className={`h-11 px-3 border rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none transition-all text-sm ${fieldErrors.ethnic ? "border-[#EF4444]" : "border-[#D0D5DD]"}`}
                        />
                        {fieldErrors.ethnic && (
                          <p className="text-[11px] text-[#EF4444]">
                            {fieldErrors.ethnic}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#344054]">
                          Tôn giáo <span className="text-[#EF4444]">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.religion}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              religion: e.target.value,
                            }));
                            if (fieldErrors.religion)
                              setFieldErrors((prev) => ({
                                ...prev,
                                religion: "",
                              }));
                          }}
                          className={`h-11 px-3 border rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none transition-all text-sm ${fieldErrors.religion ? "border-[#EF4444]" : "border-[#D0D5DD]"}`}
                        />
                        {fieldErrors.religion && (
                          <p className="text-[11px] text-[#EF4444]">
                            {fieldErrors.religion}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#344054]">
                          Quốc tịch
                        </label>
                        <input
                          type="text"
                          value={formData.nation}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              nation: e.target.value,
                            }));
                          }}
                          className={`h-11 px-3 border rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none transition-all text-sm ${fieldErrors.nation ? "border-[#EF4444]" : "border-[#D0D5DD]"}`}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-[#344054]">
                          Tỉnh/Thành phố{" "}
                          <span className="text-[#EF4444]">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.province}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              province: e.target.value,
                            }));
                            if (fieldErrors.province)
                              setFieldErrors((prev) => ({
                                ...prev,
                                province: "",
                              }));
                          }}
                          className={`h-11 px-3 border rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none transition-all text-sm ${fieldErrors.province ? "border-[#EF4444]" : "border-[#D0D5DD]"}`}
                        />
                        {fieldErrors.province && (
                          <p className="text-[11px] text-[#EF4444]">
                            {fieldErrors.province}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-[#344054]">
                          Địa chỉ <span className="text-[#EF4444]">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              address: e.target.value,
                            }));
                            if (fieldErrors.address)
                              setFieldErrors((prev) => ({
                                ...prev,
                                address: "",
                              }));
                          }}
                          className={`h-11 px-3 border rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none transition-all text-sm ${fieldErrors.address ? "border-[#EF4444]" : "border-[#D0D5DD]"}`}
                        />
                        {fieldErrors.address && (
                          <p className="text-[11px] text-[#EF4444]">
                            {fieldErrors.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "academic" && (
              <section className="bg-white rounded-2xl border border-[#E4E7EC] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E4E7EC] bg-[#F4F6F9] flex justify-between items-center">
                  <h3 className="text-lg font-bold text-[#344054]">
                    Hồ sơ học tập
                  </h3>
                  <button
                    onClick={handleSaveAcademic}
                    disabled={saving}
                    className="bg-[#032D60] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#021a40] transition-all active:scale-95 disabled:opacity-50"
                  >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#344054]">
                        Năm tốt nghiệp THPT{" "}
                        <span className="text-[#EF4444]">*</span>
                      </label>
                      <input
                        type="number"
                        value={academicForm.graduation_year}
                        onChange={(e) => {
                          setAcademicForm((prev) => ({
                            ...prev,
                            graduation_year: e.target.value,
                          }));
                          if (academicFieldErrors.graduation_year)
                            setAcademicFieldErrors((prev) => ({
                              ...prev,
                              graduation_year: "",
                            }));
                        }}
                        className={`h-11 px-3 border rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none transition-all text-sm ${academicFieldErrors.graduation_year ? "border-[#EF4444]" : "border-[#D0D5DD]"}`}
                        placeholder="VD: 2025"
                      />
                      {academicFieldErrors.graduation_year && (
                        <p className="text-[11px] text-[#EF4444]">
                          {academicFieldErrors.graduation_year}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-[#E4E7EC] pt-5">
                    <h4 className="text-sm font-bold text-[#344054] mb-4">
                      Thông tin học tập THPT
                    </h4>
                    {([10, 11, 12] as const).map((grade) => {
                      const schoolKey =
                        `grade_${grade}_school` as keyof typeof academicForm;
                      const scoreKey =
                        `grade_${grade}_score` as keyof typeof academicForm;
                      return (
                        <div
                          key={grade}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-[#E4E7EC] last:border-b-0 last:pb-0 last:mb-0"
                        >
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-[#344054]">
                              Lớp {grade} - Trường{" "}
                              <span className="text-[#EF4444]">*</span>
                            </label>
                            <input
                              type="text"
                              value={academicForm[schoolKey]}
                              onChange={(e) => {
                                setAcademicForm((prev) => ({
                                  ...prev,
                                  [schoolKey]: e.target.value,
                                }));
                                if (academicFieldErrors[schoolKey])
                                  setAcademicFieldErrors((prev) => ({
                                    ...prev,
                                    [schoolKey]: "",
                                  }));
                              }}
                              className={`h-11 px-3 border rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none transition-all text-sm ${academicFieldErrors[schoolKey] ? "border-[#EF4444]" : "border-[#D0D5DD]"}`}
                              placeholder={`Tên trường lớp ${grade}`}
                            />
                            {academicFieldErrors[schoolKey] && (
                              <p className="text-[11px] text-[#EF4444]">
                                {academicFieldErrors[schoolKey]}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-[#344054]">
                              Lớp {grade} - Điểm TB{" "}
                              <span className="text-[#EF4444]">*</span>
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={academicForm[scoreKey]}
                              onChange={(e) => {
                                setAcademicForm((prev) => ({
                                  ...prev,
                                  [scoreKey]: e.target.value,
                                }));
                                if (academicFieldErrors[scoreKey])
                                  setAcademicFieldErrors((prev) => ({
                                    ...prev,
                                    [scoreKey]: "",
                                  }));
                              }}
                              className={`h-11 px-3 border rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none transition-all text-sm ${academicFieldErrors[scoreKey] ? "border-[#EF4444]" : "border-[#D0D5DD]"}`}
                              placeholder="VD: 8.5"
                            />
                            {academicFieldErrors[scoreKey] && (
                              <p className="text-[11px] text-[#EF4444]">
                                {academicFieldErrors[scoreKey]}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {academic?.academic_record?.exam_scores &&
                  academic.academic_record.exam_scores.length > 0 &&
                  examMode === "view" ? (
                    <div className="border-t border-[#E4E7EC] pt-5">
                      <h4 className="text-sm font-bold text-[#344054] mb-4">
                        Điểm thi hiện tại
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {academic.academic_record.exam_scores.map((score) => (
                          <div
                            key={score.subject_code}
                            className="bg-[#F9FAFB] rounded-lg px-4 py-3 flex justify-between items-center"
                          >
                            <span className="text-sm text-[#344054]">
                              {score.subject_name}
                            </span>
                            <span className="text-sm font-bold text-[#344054]">
                              {score.score}
                            </span>
                          </div>
                        ))}
                      </div>
                      {academic.academic_record.foreign_language && (
                        <p className="text-xs text-[#667085] mt-2">
                          Ngoại ngữ:{" "}
                          {
                            academic.academic_record.foreign_language
                              .language_name
                          }
                        </p>
                      )}

                      {/* Giấy chứng nhận kết quả thi */}
                      {(() => {
                        const certDoc = documents.find(
                          (d) => d.document_type === "EXAM_CERTIFICATE",
                        );
                        if (!certDoc) return null;
                        const isImage =
                          certDoc.file_type.startsWith("image/") ||
                          /\.(jpg|jpeg|png|gif|webp)$/i.test(certDoc.file_url);
                        return (
                          <div className="mt-4 border-t border-[#E4E7EC] pt-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-xs font-semibold text-[#344054]">
                                Giấy chứng nhận kết quả thi
                              </h5>
                              {!certEditing && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => setCertEditing(true)}
                                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[#032D60] border border-[#032D60] rounded hover:bg-[#EFF6FF] transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">
                                      edit
                                    </span>
                                    Sửa
                                  </button>
                                  <button
                                    onClick={() => setDeleteCertTarget(certDoc)}
                                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[#EF4444] border border-[#EF4444] rounded hover:bg-[#FEF2F2] transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">
                                      delete
                                    </span>
                                    Xóa
                                  </button>
                                </div>
                              )}
                            </div>
                            {certEditing ? (
                              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-3">
                                <p className="text-xs text-[#1E40AF] mb-2 font-semibold">
                                  Chọn file giấy chứng nhận mới:
                                </p>
                                <div className="flex items-center gap-2">
                                  <label className="flex-1 flex items-center justify-center gap-2 h-9 px-3 border border-dashed border-[#93C5FD] rounded-lg cursor-pointer hover:border-[#3B82F6] transition-colors bg-white">
                                    <span className="material-symbols-outlined text-[16px] text-[#3B82F6]">
                                      cloud_upload
                                    </span>
                                    <span className="text-xs text-[#3B82F6]">
                                      {newCertFile
                                        ? newCertFile.name
                                        : "Chọn file"}
                                    </span>
                                    <input
                                      type="file"
                                      accept=".pdf,.jpg,.jpeg,.png"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setNewCertFile(file);
                                      }}
                                    />
                                  </label>
                                  {uploadingScores && (
                                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-[#032D60] rounded-full transition-all duration-200"
                                        style={{ width: `${uploadProgress}%` }}
                                      />
                                    </div>
                                  )}
                                  <button
                                    onClick={() =>
                                      handleReplaceCertificate(certDoc.id)
                                    }
                                    disabled={!newCertFile || uploadingScores}
                                    className="h-9 px-3 bg-[#032D60] text-white text-xs font-semibold rounded-lg hover:bg-[#021a40] disabled:opacity-50 transition-colors"
                                  >
                                    {uploadingScores
                                      ? `${uploadProgress}%`
                                      : "Lưu"}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setCertEditing(false);
                                      setNewCertFile(null);
                                    }}
                                    className="h-9 px-3 text-xs font-semibold text-[#667085] border border-[#D0D5DD] rounded-lg hover:bg-[#F9FAFB] transition-colors"
                                  >
                                    Hủy
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-[#F9FAFB] rounded-lg p-3 flex items-center gap-3">
                                {isImage ? (
                                  <img
                                    src={certDoc.file_url}
                                    alt={certDoc.file_name}
                                    className="w-16 h-16 object-cover rounded border border-[#E4E7EC]"
                                  />
                                ) : (
                                  <span className="material-symbols-outlined text-[32px] text-[#032D60]">
                                    picture_as_pdf
                                  </span>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium text-[#344054] truncate">
                                    {certDoc.file_name}
                                  </p>
                                  <p className="text-[10px] text-[#667085]">
                                    Cập nhật:{" "}
                                    {new Date(
                                      certDoc.uploaded_at,
                                    ).toLocaleDateString("vi-VN")}
                                  </p>
                                </div>
                                <button
                                  onClick={() => setViewCertDoc(certDoc)}
                                  className="text-[#032D60] hover:text-[#021a40]"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    open_in_new
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="border-t border-[#E4E7EC] pt-5 mt-5">
                      <h4 className="text-sm font-bold text-[#344054] mb-1">
                        {examMode === "edit"
                          ? "Sửa điểm thi"
                          : "Cập nhật điểm thi"}
                      </h4>
                      <p className="text-xs text-[#667085] mb-4">
                        Bắt buộc Toán + Văn. Chọn thêm 2 môn tự chọn. Tải lên
                        giấy chứng nhận kết quả thi.
                      </p>

                      {/* Required subjects */}
                      <div className="mb-4">
                        <h5 className="text-xs font-semibold text-[#344054] mb-2">
                          Môn bắt buộc
                        </h5>
                        <div className="grid grid-cols-2 gap-4">
                          {examScores
                            .filter(
                              (s) =>
                                s.subject_code === "TOAN" ||
                                s.subject_code === "VAN",
                            )
                            .map((s) => {
                              const globalIdx = examScores.findIndex(
                                (x) => x.subject_code === s.subject_code,
                              );
                              return (
                                <div
                                  key={s.subject_code}
                                  className="flex flex-col gap-1.5"
                                >
                                  <label className="text-xs font-semibold text-[#344054]">
                                    {s.subject_name} *
                                  </label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="10"
                                    value={s.score}
                                    onChange={(e) =>
                                      updateExamScore(globalIdx, e.target.value)
                                    }
                                    className="h-11 px-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none transition-all text-sm"
                                    placeholder="0.0 - 10.0"
                                  />
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {/* Optional subjects */}
                      <div className="mb-4">
                        <h5 className="text-xs font-semibold text-[#344054] mb-1">
                          Môn tự chọn{" "}
                          <span className="text-[#667085] font-normal">
                            (Chọn đúng 2)
                          </span>
                        </h5>
                        <p className="text-[11px] text-[#667085] mb-2">
                          Đã chọn: {selectedOptional.length}/2
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-3">
                          {OPTIONAL_SUBJECTS.map((opt) => {
                            const isSelected = selectedOptional.includes(
                              opt.code,
                            );
                            const isFull =
                              selectedOptional.length >= 2 && !isSelected;
                            return (
                              <button
                                key={opt.code}
                                onClick={() => toggleOptionalSubject(opt.code)}
                                disabled={isFull}
                                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                                  isSelected
                                    ? "bg-[#032D60] text-white border-[#032D60]"
                                    : isFull
                                      ? "bg-[#F9FAFB] text-[#9CA3AF] border-[#E4E7EC] cursor-not-allowed"
                                      : "bg-white text-[#344054] border-[#D0D5DD] hover:border-[#032D60] hover:text-[#032D60]"
                                }`}
                              >
                                {opt.name}
                              </button>
                            );
                          })}
                        </div>

                        {selectedOptional.length > 0 && (
                          <div className="grid grid-cols-2 gap-4">
                            {examScores
                              .filter((s) =>
                                selectedOptional.includes(s.subject_code),
                              )
                              .map((s) => {
                                const globalIdx = examScores.findIndex(
                                  (x) => x.subject_code === s.subject_code,
                                );
                                return (
                                  <div
                                    key={s.subject_code}
                                    className="flex flex-col gap-1.5"
                                  >
                                    <label className="text-xs font-semibold text-[#344054]">
                                      {s.subject_name} *
                                    </label>
                                    <input
                                      type="number"
                                      step="0.1"
                                      min="0"
                                      max="10"
                                      value={s.score}
                                      onChange={(e) =>
                                        updateExamScore(
                                          globalIdx,
                                          e.target.value,
                                        )
                                      }
                                      className="h-11 px-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none transition-all text-sm"
                                      placeholder="0.0 - 10.0"
                                    />
                                  </div>
                                );
                              })}
                          </div>
                        )}

                        {selectedOptional.includes("NGOAINGU") && (
                          <div className="mt-3 p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg">
                            <label className="text-xs font-semibold text-[#1E40AF] mb-2 block">
                              Chọn ngoại ngữ thi *
                            </label>
                            <select
                              value={foreignLanguage}
                              onChange={(e) =>
                                setForeignLanguage(e.target.value)
                              }
                              className="h-11 px-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none transition-all text-sm bg-white"
                            >
                              <option value="">-- Chọn ngoại ngữ --</option>
                              {FOREIGN_LANGUAGES.map((lang) => (
                                <option key={lang.code} value={lang.code}>
                                  {lang.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Exam certificate upload */}
                      <div className="flex flex-col gap-1.5 mb-4">
                        <label className="text-xs font-semibold text-[#344054]">
                          Giấy chứng nhận kết quả thi *
                        </label>
                        <div className="border border-dashed border-[#D0D5DD] rounded-lg p-4 text-center hover:border-[#032D60] transition-colors">
                          <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-[#032D60] hover:text-[#021a40]">
                            <span className="material-symbols-outlined text-[20px]">
                              cloud_upload
                            </span>
                            {examCertificate
                              ? examCertificate.name
                              : "Chọn file (PDF, JPG, PNG)"}
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setExamCertificate(file);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                      {uploadingScores && (
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#032D60] rounded-full transition-all duration-200"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                      <button
                        onClick={handleUploadExamScores}
                        disabled={uploadingScores}
                        className="bg-[#032D60] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#021a40] transition-all active:scale-95 disabled:opacity-50"
                      >
                        {uploadingScores
                          ? `${uploadProgress}%`
                          : "Cập nhật điểm thi"}
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === "security" && (
              <section className="bg-white rounded-2xl border border-[#E4E7EC] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E4E7EC] bg-[#F4F6F9]">
                  <h3 className="text-lg font-bold text-[#344054]">
                    Đổi mật khẩu
                  </h3>
                </div>
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#344054]">
                        Mật khẩu hiện tại
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordForm.current_password}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              current_password: e.target.value,
                            }))
                          }
                          className={`w-full h-11 px-3 pr-10 border rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none transition-all text-sm ${
                            passwordErrors.current_password
                              ? "border-[#EF4444]"
                              : "border-[#D0D5DD]"
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onMouseDown={() => setShowCurrentPassword(true)}
                          onMouseUp={() => setShowCurrentPassword(false)}
                          onMouseLeave={() => setShowCurrentPassword(false)}
                          onTouchStart={() => setShowCurrentPassword(true)}
                          onTouchEnd={() => setShowCurrentPassword(false)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#344054] transition-colors select-none"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {showCurrentPassword
                              ? "visibility_off"
                              : "visibility"}
                          </span>
                        </button>
                      </div>
                      {passwordErrors.current_password && (
                        <p className="text-[11px] text-[#EF4444] mt-0.5">
                          {passwordErrors.current_password}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#344054]">
                        Mật khẩu mới
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordForm.new_password}
                          onChange={(e) => {
                            setPasswordForm((prev) => ({
                              ...prev,
                              new_password: e.target.value,
                            }));
                            validatePasswordField(e.target.value);
                          }}
                          className={`w-full h-11 px-3 pr-10 border rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none transition-all text-sm ${
                            passwordErrors.new_password
                              ? "border-[#EF4444]"
                              : passwordForm.new_password &&
                                  !passwordErrors.new_password
                                ? "border-[#04844B]"
                                : "border-[#D0D5DD]"
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onMouseDown={() => setShowNewPassword(true)}
                          onMouseUp={() => setShowNewPassword(false)}
                          onMouseLeave={() => setShowNewPassword(false)}
                          onTouchStart={() => setShowNewPassword(true)}
                          onTouchEnd={() => setShowNewPassword(false)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#344054] transition-colors select-none"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {showNewPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                      {passwordForm.new_password && (
                        <div className="mt-1 space-y-1">
                          {passwordChecks.map((check) => (
                            <div
                              key={check.key}
                              className="flex items-center gap-1.5"
                            >
                              <span
                                className={`material-symbols-outlined text-[14px] ${
                                  check.test(passwordForm.new_password)
                                    ? "text-[#04844B]"
                                    : "text-[#667085]"
                                }`}
                                style={{
                                  fontVariationSettings: check.test(
                                    passwordForm.new_password,
                                  )
                                    ? "'FILL' 1"
                                    : "'FILL' 0",
                                }}
                              >
                                {check.test(passwordForm.new_password)
                                  ? "check_circle"
                                  : "radio_button_unchecked"}
                              </span>
                              <span
                                className={`text-[11px] ${check.test(passwordForm.new_password) ? "text-[#04844B]" : "text-[#667085]"}`}
                              >
                                {check.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {passwordErrors.new_password && (
                        <p className="text-[11px] text-[#EF4444] mt-0.5">
                          {passwordErrors.new_password}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#344054]">
                        Xác nhận mật khẩu mới
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordForm.confirm_password}
                          onChange={(e) => {
                            setPasswordForm((prev) => ({
                              ...prev,
                              confirm_password: e.target.value,
                            }));
                            if (
                              e.target.value &&
                              e.target.value !== passwordForm.new_password
                            ) {
                              setPasswordErrors((prev) => ({
                                ...prev,
                                confirm_password:
                                  "Mật khẩu xác nhận không khớp",
                              }));
                            } else {
                              setPasswordErrors((prev) => ({
                                ...prev,
                                confirm_password: "",
                              }));
                            }
                          }}
                          className={`w-full h-11 px-3 pr-10 border rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none transition-all text-sm ${
                            passwordErrors.confirm_password
                              ? "border-[#EF4444]"
                              : passwordForm.confirm_password &&
                                  !passwordErrors.confirm_password
                                ? "border-[#04844B]"
                                : "border-[#D0D5DD]"
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onMouseDown={() => setShowConfirmPassword(true)}
                          onMouseUp={() => setShowConfirmPassword(false)}
                          onMouseLeave={() => setShowConfirmPassword(false)}
                          onTouchStart={() => setShowConfirmPassword(true)}
                          onTouchEnd={() => setShowConfirmPassword(false)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#344054] transition-colors select-none"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {showConfirmPassword
                              ? "visibility_off"
                              : "visibility"}
                          </span>
                        </button>
                      </div>
                      {passwordErrors.confirm_password && (
                        <p className="text-[11px] text-[#EF4444] mt-0.5">
                          {passwordErrors.confirm_password}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className="bg-[#032D60] text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-[#021a40] transition-all active:scale-95 disabled:opacity-50"
                    >
                      {changingPassword
                        ? "Đang cập nhật..."
                        : "Cập nhật mật khẩu"}
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
      {viewCertDoc && (
        <DocumentViewer
          fileUrl={viewCertDoc.file_url}
          fileType={viewCertDoc.file_type}
          fileName={viewCertDoc.file_name}
          onClose={() => setViewCertDoc(null)}
        />
      )}
      {deleteCertTarget && (
        <ConfirmDialog
          message="Xóa giấy chứng nhận kết quả thi?"
          confirmLabel="Xóa"
          danger
          onConfirm={async () => {
            try {
              await admissionsApi.deleteDocument(deleteCertTarget.id);
              setDocuments((prev) =>
                prev.filter((d) => d.id !== deleteCertTarget.id),
              );
              setMessage({
                type: "success",
                text: "Đã xóa giấy chứng nhận.",
              });
            } catch {
              setMessage({
                type: "error",
                text: "Xóa thất bại.",
              });
            }
            setDeleteCertTarget(null);
          }}
          onCancel={() => setDeleteCertTarget(null)}
        />
      )}
    </>
  );
};

export default ProfilePage;
