import { useState, useEffect } from "react";
import {
  profileApi,
  type CandidateProfileData,
  type AcademicRecordData,
} from "../apis/profile";

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
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [academicForm, setAcademicForm] = useState({
    graduation_year: "",
    science_group: "",
    grade_10_school: "",
    grade_10_score: "",
    grade_11_school: "",
    grade_11_score: "",
    grade_12_school: "",
    grade_12_score: "",
  });

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
          "Đổi mật khẩu thất bại. Vui lòng thử lại.",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, academicRes] = await Promise.all([
          profileApi.getProfile(),
          profileApi.getAcademicRecord(),
        ]);
        const p = profileRes.data.data;
        const a = academicRes.data.data;
        setProfile(p);
        setAcademic(a);

        const cp = p.candidate_profile;
        setFormData({
          full_name: cp.full_name || "",
          phone: cp.phone || "",
          date_of_birth: cp.date_of_birth ? cp.date_of_birth.split("T")[0] : "",
          gender: cp.gender || "",
          province: cp.province || "",
          address: cp.address || "",
          ethnic: cp.ethnic || "",
          religion: cp.religion || "",
        });

        const ar = a.academic_record;
        const ap = a.academic_progress;
        setAcademicForm({
          graduation_year: ar?.graduation_year?.toString() || "",
          science_group: ar?.science_group || "",
          grade_10_school: ap.grade_10?.school_name || "",
          grade_10_score: ap.grade_10?.avg_score?.toString() || "",
          grade_11_school: ap.grade_11?.school_name || "",
          grade_11_score: ap.grade_11?.avg_score?.toString() || "",
          grade_12_school: ap.grade_12?.school_name || "",
          grade_12_score: ap.grade_12?.avg_score?.toString() || "",
        });
      } catch {
        setMessage({ type: "error", text: "Không thể tải thông tin hồ sơ." });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
      };
      if (formData.phone) payload.phone = formData.phone;
      if (formData.date_of_birth)
        payload.date_of_birth = formData.date_of_birth;
      if (formData.gender) payload.gender = formData.gender;
      if (formData.province) payload.province = formData.province;
      if (formData.address) payload.address = formData.address;
      if (formData.ethnic) payload.ethnic = formData.ethnic;
      if (formData.religion) payload.religion = formData.religion;
      const res = await profileApi.updateProfile(payload as never);
      setProfile(res.data.data);
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
      const acadPayload: Record<string, unknown> = {};
      if (academicForm.graduation_year)
        acadPayload.graduation_year = parseInt(academicForm.graduation_year);
      if (academicForm.science_group)
        acadPayload.science_group = academicForm.science_group;
      await profileApi.upsertAcademicRecord(acadPayload as never);

      const progressPayload: Record<string, unknown> = {};
      if (academicForm.grade_10_school || academicForm.grade_10_score) {
        const g10: Record<string, unknown> = {};
        if (academicForm.grade_10_school)
          g10.school_name = academicForm.grade_10_school;
        if (academicForm.grade_10_score)
          g10.avg_score = parseFloat(academicForm.grade_10_score);
        progressPayload.grade_10 = g10;
      }
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
          <span className="material-symbols-outlined text-[#0EA5E9] animate-spin text-[40px]">
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
          <h1 className="text-[32px] font-bold text-[#0B1F44]">
            Hồ sơ của tôi
          </h1>
          <p className="text-[#667085] text-sm mt-1">
            Quản lý thông tin cá nhân và hồ sơ học tập
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
              message.type === "success"
                ? "bg-[#ECFDF5] text-[#04844B] border border-[#A7F3D0]"
                : "bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA]"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-sm overflow-hidden sticky top-24">
              <div className="p-5 border-b border-[#E4E7EC]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0EA5E9] flex items-center justify-center text-white font-bold">
                    {profile?.candidate_profile?.full_name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#101828] truncate">
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
                        ? "bg-[#0EA5E9]/10 border-l-4 border-[#0EA5E9] text-[#0EA5E9] font-semibold"
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
              <section className="bg-white rounded-xl border border-[#E4E7EC] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E4E7EC] bg-[#F9FAFB] flex justify-between items-center">
                  <h3 className="text-lg font-bold text-[#101828]">
                    Thông tin cá nhân
                  </h3>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-[#0EA5E9] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#0095d4] transition-all active:scale-95 disabled:opacity-50"
                  >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full border-4 border-[#E4E7EC] overflow-hidden bg-[#0EA5E9] flex items-center justify-center">
                        <span className="text-white text-3xl font-bold">
                          {profile?.candidate_profile?.full_name?.charAt(0) ||
                            "?"}
                        </span>
                      </div>
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
                          className={`h-10 px-3 border rounded-lg focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] outline-none transition-all text-sm ${fieldErrors.full_name ? "border-[#EF4444]" : "border-[#D0D5DD]"}`}
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
                          className="h-10 px-3 border border-[#D0D5DD] rounded-lg bg-[#F9FAFB] text-[#667085] cursor-not-allowed text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#344054]">
                          Số điện thoại{" "}
                          <span className="text-gray-400 text-[10px] font-normal">
                            (Không bắt buộc)
                          </span>
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
                          className={`h-10 px-3 border rounded-lg focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] outline-none transition-all text-sm ${fieldErrors.phone ? "border-[#EF4444]" : "border-[#D0D5DD]"}`}
                        />
                        {fieldErrors.phone && (
                          <p className="text-[11px] text-[#EF4444]">
                            {fieldErrors.phone}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#344054]">
                          Ngày sinh{" "}
                          <span className="text-gray-400 text-[10px] font-normal">
                            (Không bắt buộc)
                          </span>
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
                          className={`h-10 px-3 border rounded-lg focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] outline-none transition-all text-sm ${fieldErrors.date_of_birth ? "border-[#EF4444]" : "border-[#D0D5DD]"}`}
                        />
                        {fieldErrors.date_of_birth && (
                          <p className="text-[11px] text-[#EF4444]">
                            {fieldErrors.date_of_birth}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#344054]">
                          Giới tính{" "}
                          <span className="text-gray-400 text-[10px] font-normal">
                            (Không bắt buộc)
                          </span>
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
                          className={`h-10 px-3 border rounded-lg focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] outline-none transition-all text-sm bg-white ${fieldErrors.gender ? "border-[#EF4444]" : "border-[#D0D5DD]"}`}
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
                          Dân tộc{" "}
                          <span className="text-gray-400 text-[10px] font-normal">
                            (Không bắt buộc)
                          </span>
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
                          className={`h-10 px-3 border rounded-lg focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] outline-none transition-all text-sm ${fieldErrors.ethnic ? "border-[#EF4444]" : "border-[#D0D5DD]"}`}
                        />
                        {fieldErrors.ethnic && (
                          <p className="text-[11px] text-[#EF4444]">
                            {fieldErrors.ethnic}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#344054]">
                          Tôn giáo{" "}
                          <span className="text-gray-400 text-[10px] font-normal">
                            (Không bắt buộc)
                          </span>
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
                          className={`h-10 px-3 border rounded-lg focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] outline-none transition-all text-sm ${fieldErrors.religion ? "border-[#EF4444]" : "border-[#D0D5DD]"}`}
                        />
                        {fieldErrors.religion && (
                          <p className="text-[11px] text-[#EF4444]">
                            {fieldErrors.religion}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-[#344054]">
                          Tỉnh/Thành phố{" "}
                          <span className="text-gray-400 text-[10px] font-normal">
                            (Không bắt buộc)
                          </span>
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
                          className={`h-10 px-3 border rounded-lg focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] outline-none transition-all text-sm ${fieldErrors.province ? "border-[#EF4444]" : "border-[#D0D5DD]"}`}
                        />
                        {fieldErrors.province && (
                          <p className="text-[11px] text-[#EF4444]">
                            {fieldErrors.province}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-[#344054]">
                          Địa chỉ{" "}
                          <span className="text-gray-400 text-[10px] font-normal">
                            (Không bắt buộc)
                          </span>
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
                          className={`h-10 px-3 border rounded-lg focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] outline-none transition-all text-sm ${fieldErrors.address ? "border-[#EF4444]" : "border-[#D0D5DD]"}`}
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
              <section className="bg-white rounded-xl border border-[#E4E7EC] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E4E7EC] bg-[#F9FAFB] flex justify-between items-center">
                  <h3 className="text-lg font-bold text-[#101828]">
                    Hồ sơ học tập
                  </h3>
                  <button
                    onClick={handleSaveAcademic}
                    disabled={saving}
                    className="bg-[#0EA5E9] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#0095d4] transition-all active:scale-95 disabled:opacity-50"
                  >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#344054]">
                        Năm tốt nghiệp THPT{" "}
                        <span className="text-gray-400 text-[10px] font-normal">
                          (Không bắt buộc)
                        </span>
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
                        className={`h-10 px-3 border rounded-lg focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] outline-none transition-all text-sm ${academicFieldErrors.graduation_year ? "border-[#EF4444]" : "border-[#D0D5DD]"}`}
                        placeholder="VD: 2025"
                      />
                      {academicFieldErrors.graduation_year && (
                        <p className="text-[11px] text-[#EF4444]">
                          {academicFieldErrors.graduation_year}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#344054]">
                        Khối thi{" "}
                        <span className="text-gray-400 text-[10px] font-normal">
                          (Không bắt buộc)
                        </span>
                      </label>
                      <select
                        value={academicForm.science_group}
                        onChange={(e) => {
                          setAcademicForm((prev) => ({
                            ...prev,
                            science_group: e.target.value,
                          }));
                          if (academicFieldErrors.science_group)
                            setAcademicFieldErrors((prev) => ({
                              ...prev,
                              science_group: "",
                            }));
                        }}
                        className={`h-10 px-3 border rounded-lg focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] outline-none transition-all text-sm bg-white ${academicFieldErrors.science_group ? "border-[#EF4444]" : "border-[#D0D5DD]"}`}
                      >
                        <option value="">Chọn khối</option>
                        <option value="NATURAL">Khối A (Tự nhiên)</option>
                        <option value="SOCIAL">Khối C (Xã hội)</option>
                      </select>
                      {academicFieldErrors.science_group && (
                        <p className="text-[11px] text-[#EF4444]">
                          {academicFieldErrors.science_group}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-[#E4E7EC] pt-5">
                    <h4 className="text-sm font-bold text-[#101828] mb-4">
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
                              <span className="text-gray-400 text-[10px] font-normal">
                                (Không bắt buộc)
                              </span>
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
                              className={`h-10 px-3 border rounded-lg focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] outline-none transition-all text-sm ${academicFieldErrors[schoolKey] ? "border-[#EF4444]" : "border-[#D0D5DD]"}`}
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
                              <span className="text-gray-400 text-[10px] font-normal">
                                (Không bắt buộc)
                              </span>
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
                              className={`h-10 px-3 border rounded-lg focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] outline-none transition-all text-sm ${academicFieldErrors[scoreKey] ? "border-[#EF4444]" : "border-[#D0D5DD]"}`}
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
                    academic.academic_record.exam_scores.length > 0 && (
                      <div className="border-t border-[#E4E7EC] pt-5">
                        <h4 className="text-sm font-bold text-[#101828] mb-4">
                          Điểm thi
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {academic.academic_record.exam_scores.map((score) => (
                            <div
                              key={score.subject_code}
                              className="bg-[#F9FAFB] rounded-lg px-4 py-3 flex justify-between items-center"
                            >
                              <span className="text-sm text-[#344054]">
                                {score.subject_name}
                              </span>
                              <span className="text-sm font-bold text-[#101828]">
                                {score.score}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </section>
            )}

            {activeTab === "security" && (
              <section className="bg-white rounded-xl border border-[#E4E7EC] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E4E7EC] bg-[#F9FAFB]">
                  <h3 className="text-lg font-bold text-[#101828]">
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
                          className={`w-full h-10 px-3 pr-10 border rounded-lg focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] outline-none transition-all text-sm ${
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
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#101828] transition-colors select-none"
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
                          className={`w-full h-10 px-3 pr-10 border rounded-lg focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] outline-none transition-all text-sm ${
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
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#101828] transition-colors select-none"
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
                          className={`w-full h-10 px-3 pr-10 border rounded-lg focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] outline-none transition-all text-sm ${
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
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#101828] transition-colors select-none"
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
                      className="bg-[#002B5B] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#001F42] transition-all active:scale-95 disabled:opacity-50"
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
    </>
  );
};

export default ProfilePage;
