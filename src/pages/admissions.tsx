import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { profileApi } from "../apis/profile";
import {
  admissionsApi,
  type University,
  type Major,
  type Combination,
  type DocumentData,
} from "../apis/admissions";

type Step = 1 | 2 | 3 | 4;

interface Wish {
  university: University;
  major: Major;
  combination: Combination;
}

interface ScoreEntry {
  subject_code: string;
  subject_name: string;
  score: string;
}

const STEP_LABELS = [
  "Thông tin cá nhân",
  "Chọn nguyện vọng",
  "Nhập điểm & Minh chứng",
  "Kiểm tra & Xác nhận",
];

const NATURAL_SUBJECTS: ScoreEntry[] = [
  { subject_code: "TOAN", subject_name: "Toán", score: "" },
  { subject_code: "VAN", subject_name: "Ngữ văn", score: "" },
  { subject_code: "ANH", subject_name: "Tiếng Anh", score: "" },
  { subject_code: "LY", subject_name: "Vật lý", score: "" },
  { subject_code: "HOA", subject_name: "Hóa học", score: "" },
  { subject_code: "SINH", subject_name: "Sinh học", score: "" },
];

const SOCIAL_SUBJECTS: ScoreEntry[] = [
  { subject_code: "TOAN", subject_name: "Toán", score: "" },
  { subject_code: "VAN", subject_name: "Ngữ văn", score: "" },
  { subject_code: "ANH", subject_name: "Tiếng Anh", score: "" },
  { subject_code: "SU", subject_name: "Lịch sử", score: "" },
  { subject_code: "DIA", subject_name: "Địa lý", score: "" },
  { subject_code: "GDCD", subject_name: "GDCD", score: "" },
];

const DOCUMENT_TYPES: { value: string; label: string }[] = [
  { value: "TRANSCRIPT", label: "Bảng điểm" },
  { value: "CITIZEN_ID", label: "CMND/CCCD" },
  { value: "PORTRAIT", label: "Ảnh thẻ" },
  { value: "CERTIFICATE", label: "Chứng chỉ khác" },
];

const normalizeSubjectName = (code: string): string => {
  const map: Record<string, string> = {
    TOAN: "Toán",
    VAN: "Ngữ văn",
    ANH: "Tiếng Anh",
    LY: "Vật lý",
    HOA: "Hóa học",
    SINH: "Sinh học",
    SU: "Lịch sử",
    DIA: "Địa lý",
    GDCD: "GDCD",
  };
  return map[code] || code;
};

const Stepper = ({ current }: { current: Step }) => (
  <div className="flex items-center justify-center gap-0 mb-8">
    {([1, 2, 3, 4] as Step[]).map((s, i) => (
      <div key={s} className="flex items-center">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              s < current
                ? "bg-[#0EA5E9] text-white"
                : s === current
                  ? "bg-[#0EA5E9] text-white ring-4 ring-[#0EA5E9]/20"
                  : "bg-[#E4E7EC] text-[#667085]"
            }`}
          >
            {s < current ? (
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check
              </span>
            ) : (
              s
            )}
          </div>
          <span
            className={`text-sm font-medium hidden sm:inline ${
              s <= current ? "text-[#101828]" : "text-[#667085]"
            }`}
          >
            {STEP_LABELS[i]}
          </span>
        </div>
        {i < 3 && (
          <div
            className={`w-12 sm:w-20 h-0.5 mx-2 ${
              s < current ? "bg-[#0EA5E9]" : "bg-[#E4E7EC]"
            }`}
          />
        )}
      </div>
    ))}
  </div>
);

const AdmissionsPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Step 1 — Profile
  const [profileData, setProfileData] = useState<{
    full_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: string;
    citizen_id: string;
    address: string;
  }>({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    citizen_id: "",
    address: "",
  });

  // Step 2 — Wishes
  const [universities, setUniversities] = useState<University[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [selectedUni, setSelectedUni] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [selectedComb, setSelectedComb] = useState("");
  const [wishes, setWishes] = useState<Wish[]>([]);

  // Step 3 — Scores & documents
  const [scienceGroup, setScienceGroup] = useState<"NATURAL" | "SOCIAL" | null>(
    null,
  );
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [profileRes, uniRes] = await Promise.all([
          profileApi.getProfile(),
          admissionsApi.getUniversities(),
        ]);
        const p = profileRes.data.data;
        const cp = p.candidate_profile;
        setProfileData({
          full_name: cp.full_name || "",
          email: p.user?.email || "",
          phone: cp.phone || "",
          date_of_birth: cp.date_of_birth ? cp.date_of_birth.split("T")[0] : "",
          gender: cp.gender || "",
          citizen_id: cp.citizen_id?.toString() || "",
          address: cp.address || "",
        });
        setUniversities(uniRes.data.data || []);
      } catch {
        setMessage({ type: "error", text: "Không thể tải thông tin." });
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  // Step 1 — save phone & address
  const handleStep1Next = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await profileApi.updateProfile({
        phone: profileData.phone || null,
        address: profileData.address || null,
      } as never);
      setStep(2);
    } catch {
      setMessage({ type: "error", text: "Lưu thông tin thất bại." });
    } finally {
      setSaving(false);
    }
  };

  // Step 2 — cascade selects
  const handleUniChange = async (code: string) => {
    setSelectedUni(code);
    setSelectedMajor("");
    setSelectedComb("");
    setMajors([]);
    setCombinations([]);
    if (!code) return;
    try {
      const res = await admissionsApi.getMajors(code);
      setMajors(res.data.data || []);
    } catch {
      setMajors([]);
    }
  };

  const handleMajorChange = async (code: string) => {
    setSelectedMajor(code);
    setSelectedComb("");
    setCombinations([]);
    if (!code || !selectedUni) return;
    try {
      const res = await admissionsApi.getCombinations(selectedUni, code);
      setCombinations(res.data.data || []);
    } catch {
      setCombinations([]);
    }
  };

  const addWish = () => {
    if (!selectedUni || !selectedMajor || !selectedComb) {
      setMessage({
        type: "error",
        text: "Vui lòng chọn đủ Trường, Ngành và Tổ hợp môn.",
      });
      return;
    }
    const uni = universities.find((u) => u.code === selectedUni);
    const major = majors.find((m) => m.code === selectedMajor);
    const comb = combinations.find((c) => c.code === selectedComb);
    if (!uni || !major || !comb) return;
    setWishes((prev) => [
      ...prev,
      { university: uni, major, combination: comb },
    ]);
    setSelectedUni("");
    setSelectedMajor("");
    setSelectedComb("");
    setMajors([]);
    setCombinations([]);
    setMessage(null);
  };

  const removeWish = (idx: number) => {
    setWishes((prev) => prev.filter((_, i) => i !== idx));
  };

  // Step 3 — scores
  useEffect(() => {
    const fetchAcademic = async () => {
      try {
        const res = await profileApi.getAcademicRecord();
        const ar = res.data.data.academic_record;
        if (ar?.science_group) {
          setScienceGroup(ar.science_group);
          setScores(
            ar.science_group === "NATURAL"
              ? NATURAL_SUBJECTS.map((s) => ({ ...s }))
              : SOCIAL_SUBJECTS.map((s) => ({ ...s })),
          );
        } else {
          setShowGroupPicker(true);
        }
      } catch {
        // no academic record yet
      }
    };
    fetchAcademic();
  }, []);

  const handleGroupSelect = (group: "NATURAL" | "SOCIAL") => {
    setScienceGroup(group);
    setShowGroupPicker(false);
    setScores(
      group === "NATURAL"
        ? NATURAL_SUBJECTS.map((s) => ({ ...s }))
        : SOCIAL_SUBJECTS.map((s) => ({ ...s })),
    );
  };

  const updateScore = (idx: number, val: string) => {
    if (
      val !== "" &&
      (isNaN(Number(val)) || Number(val) < 0 || Number(val) > 10)
    )
      return;
    setScores((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, score: val } : s)),
    );
  };

  // Step 3 — documents
  const fetchDocuments = async () => {
    try {
      const res = await admissionsApi.getDocuments();
      setDocuments(res.data.data || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await admissionsApi.getDocuments();
        setDocuments(res.data.data || []);
      } catch {
        // ignore
      }
    })();
  }, []);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await admissionsApi.uploadDocument(file, docType);
      await fetchDocuments();
    } catch {
      setMessage({ type: "error", text: "Tải file thất bại." });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteDoc = async (id: number) => {
    try {
      await admissionsApi.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setMessage({ type: "error", text: "Xóa file thất bại." });
    }
  };

  // Step 4 — submit
  const handleSubmit = async () => {
    if (!agreed) {
      setMessage({ type: "error", text: "Vui lòng đồng ý với điều khoản." });
      return;
    }
    if (wishes.length === 0) {
      setMessage({ type: "error", text: "Chưa có nguyện vọng nào." });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      for (const wish of wishes) {
        const comb = wish.combination;
        const scoreMap: Record<string, string> = {};
        scores.forEach((s) => {
          scoreMap[s.subject_code] = s.score;
        });

        const payload: {
          university_id: string;
          major_id: string;
          combination_id: string;
          subject_1_score?: number;
          subject_2_score?: number;
          subject_3_score?: number;
        } = {
          university_id: wish.university.id,
          major_id: wish.major.id,
          combination_id: wish.combination.id,
        };

        const s1 = scoreMap[comb.subject_1];
        const s2 = scoreMap[comb.subject_2];
        const s3 = scoreMap[comb.subject_3];
        if (s1) payload.subject_1_score = Number(s1);
        if (s2) payload.subject_2_score = Number(s2);
        if (s3) payload.subject_3_score = Number(s3);

        const createRes = await admissionsApi.createApplication(payload);
        const appId = createRes.data.data.id;
        await admissionsApi.submitApplication(appId);
      }
      setMessage({ type: "success", text: "Nộp hồ sơ thành công!" });
      setTimeout(() => navigate({ to: "/dashboard" }), 2000);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setMessage({
        type: "error",
        text: apiErr?.response?.data?.message || "Nộp hồ sơ thất bại.",
      });
    } finally {
      setSubmitting(false);
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
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-9 py-8 bg-[#F5F7FB]">
      <div className="mb-6">
        <h1 className="text-[32px] font-bold text-[#0B1F44]">
          Đăng ký tuyển sinh
        </h1>
        <p className="text-[#667085] text-sm mt-1">
          Hoàn tất các bước để nộp hồ sơ trực tuyến
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

      <Stepper current={step} />

      {/* Step 1 — Personal Info */}
      {step === 1 && (
        <section className="bg-white rounded-xl border border-[#E4E7EC] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E4E7EC] bg-[#F9FAFB]">
            <h3 className="text-lg font-bold text-[#101828]">
              Thông tin cá nhân & Liên lạc
            </h3>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Họ và tên">
                <input
                  type="text"
                  value={profileData.full_name}
                  disabled
                  className="input-disabled"
                />
              </Field>
              <Field label="Ngày sinh">
                <input
                  type="date"
                  value={profileData.date_of_birth}
                  disabled
                  className="input-disabled"
                />
              </Field>
              <Field label="Giới tính">
                <input
                  type="text"
                  value={
                    profileData.gender === "MALE"
                      ? "Nam"
                      : profileData.gender === "FEMALE"
                        ? "Nữ"
                        : profileData.gender === "OTHER"
                          ? "Khác"
                          : ""
                  }
                  disabled
                  className="input-disabled"
                />
              </Field>
              <Field label="Số CMND/CCCD">
                <input
                  type="text"
                  value={profileData.citizen_id}
                  disabled
                  className="input-disabled"
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="input-disabled"
                />
              </Field>
              <Field label="Số điện thoại">
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      phone: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  className="input-base"
                  placeholder="Nhập số điện thoại"
                />
              </Field>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-[#344054]">
                  Địa chỉ thường trú
                </label>
                <textarea
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="input-base min-h-[80px] resize-y"
                  placeholder="Nhập địa chỉ"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-between pt-4 border-t border-[#E4E7EC]">
              <button
                onClick={() => navigate({ to: "/dashboard" })}
                className="btn-secondary"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleStep1Next}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? "Đang lưu..." : "Tiếp theo"}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Step 2 — Wishes */}
      {step === 2 && (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 lg:w-5/12">
            <section className="bg-white rounded-xl border border-[#E4E7EC] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E4E7EC] bg-[#F9FAFB]">
                <h3 className="text-lg font-bold text-[#101828]">
                  Thêm nguyện vọng
                </h3>
              </div>
              <div className="p-6 space-y-5">
                <Field label="Trường đại học">
                  <select
                    value={selectedUni}
                    onChange={(e) => handleUniChange(e.target.value)}
                    className="input-base"
                  >
                    <option value="">Chọn trường</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.code}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Ngành học">
                  <select
                    value={selectedMajor}
                    onChange={(e) => handleMajorChange(e.target.value)}
                    className="input-base"
                    disabled={!selectedUni}
                  >
                    <option value="">Chọn ngành</option>
                    {majors.map((m) => (
                      <option key={m.id} value={m.code}>
                        {m.name}
                        {m.min_score !== null
                          ? ` (Điểm chuẩn: ${m.min_score})`
                          : ""}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Tổ hợp môn">
                  <select
                    value={selectedComb}
                    onChange={(e) => setSelectedComb(e.target.value)}
                    className="input-base"
                    disabled={!selectedMajor}
                  >
                    <option value="">Chọn tổ hợp</option>
                    {combinations.map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.code} — {normalizeSubjectName(c.subject_1)},{" "}
                        {normalizeSubjectName(c.subject_2)},{" "}
                        {normalizeSubjectName(c.subject_3)}
                      </option>
                    ))}
                  </select>
                </Field>
                <button onClick={addWish} className="btn-primary w-full">
                  Thêm vào danh sách
                </button>
              </div>
            </section>
          </div>
          <div className="flex-1 lg:w-7/12">
            <section className="bg-white rounded-xl border border-[#E4E7EC] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E4E7EC] bg-[#F9FAFB] flex justify-between items-center">
                <h3 className="text-lg font-bold text-[#101828]">
                  Danh sách nguyện vọng
                </h3>
                <span className="text-sm text-[#667085]">
                  {wishes.length.toString().padStart(2, "0")} Nguyện vọng
                </span>
              </div>
              <div className="p-6">
                {wishes.length === 0 ? (
                  <div className="text-center py-12 text-[#667085]">
                    <span className="material-symbols-outlined text-[48px] block mb-2">
                      playlist_add
                    </span>
                    <p>Chưa có nguyện vọng nào</p>
                    <p className="text-xs mt-1">
                      Thêm nguyện vọng từ form bên cạnh
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {wishes.map((w, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-4 border border-[#E4E7EC] rounded-lg hover:bg-[#F9FAFB] transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#101828]">
                            {w.university.name}
                          </p>
                          <p className="text-xs text-[#667085] mt-0.5">
                            {w.major.name}
                          </p>
                          <p className="text-xs text-[#667085]">
                            Tổ hợp: {w.combination.code} (
                            {normalizeSubjectName(w.combination.subject_1)},{" "}
                            {normalizeSubjectName(w.combination.subject_2)},{" "}
                            {normalizeSubjectName(w.combination.subject_3)})
                          </p>
                        </div>
                        <button
                          onClick={() => removeWish(i)}
                          className="text-[#EF4444] hover:text-[#DC2626] p-1 flex-shrink-0"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            delete
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
            <div className="mt-4 p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#F59E0B] text-[20px]">
                  info
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#92400E]">
                    Lưu ý quan trọng
                  </p>
                  <p className="text-xs text-[#92400E] mt-1">
                    Mỗi thí sinh có thể đăng ký nhiều nguyện vọng và sắp xếp
                    theo thứ tự ưu tiên. Sau khi nộp hồ sơ sẽ không thể thay
                    đổi.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(1)} className="btn-secondary">
                Quay lại
              </button>
              <button onClick={() => setStep(3)} className="btn-primary">
                Tiếp tục bước 3
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — Scores & Documents */}
      {step === 3 && (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 lg:w-7/12">
            <section className="bg-white rounded-xl border border-[#E4E7EC] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E4E7EC] bg-[#F9FAFB]">
                <h3 className="text-lg font-bold text-[#101828]">
                  Nhập điểm thi
                </h3>
              </div>
              <div className="p-6 space-y-5">
                {showGroupPicker ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-[#667085] mb-4">
                      Vui lòng chọn khối thi để nhập điểm
                    </p>
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => handleGroupSelect("NATURAL")}
                        className="btn-primary"
                      >
                        Khối A (Tự nhiên)
                      </button>
                      <button
                        onClick={() => handleGroupSelect("SOCIAL")}
                        className="btn-primary"
                      >
                        Khối C (Xã hội)
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-[#344054]">
                        Khối:{" "}
                        {scienceGroup === "NATURAL"
                          ? "A (Tự nhiên)"
                          : "C (Xã hội)"}
                      </span>
                      <button
                        onClick={() => setShowGroupPicker(true)}
                        className="text-xs text-[#0EA5E9] hover:underline"
                      >
                        (Đổi khối)
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {scores.map((s, i) => (
                        <div
                          key={s.subject_code}
                          className="flex flex-col gap-1.5"
                        >
                          <label className="text-xs font-semibold text-[#344054]">
                            {s.subject_name}
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={s.score}
                            onChange={(e) => updateScore(i, e.target.value)}
                            className="input-base"
                            placeholder="0.0"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>
          <div className="flex-1 lg:w-5/12">
            <section className="bg-white rounded-xl border border-[#E4E7EC] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E4E7EC] bg-[#F9FAFB]">
                <h3 className="text-lg font-bold text-[#101828]">
                  Tải lên minh chứng
                </h3>
              </div>
              <div className="p-6 space-y-5">
                {DOCUMENT_TYPES.map((dt) => (
                  <div
                    key={dt.value}
                    className="border border-dashed border-[#D0D5DD] rounded-lg p-4 text-center hover:border-[#0EA5E9] transition-colors"
                  >
                    <p className="text-sm font-medium text-[#344054] mb-2">
                      {dt.label}
                    </p>
                    <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-[#0EA5E9] hover:text-[#0095d4]">
                      <span className="material-symbols-outlined text-[20px]">
                        cloud_upload
                      </span>
                      Chọn file
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleUpload(e, dt.value)}
                        disabled={uploading}
                      />
                    </label>
                    <p className="text-[10px] text-[#667085] mt-1">
                      PDF, JPG, PNG tối đa 5MB
                    </p>
                  </div>
                ))}
                {documents.length > 0 && (
                  <div className="border-t border-[#E4E7EC] pt-4 mt-4">
                    <h4 className="text-xs font-semibold text-[#667085] mb-3 uppercase tracking-wide">
                      Đã tải lên
                    </h4>
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 bg-[#F9FAFB] rounded-lg"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="material-symbols-outlined text-[#0EA5E9] text-[18px]">
                              description
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-[#101828] truncate">
                                {doc.file_name}
                              </p>
                              <p className="text-[10px] text-[#667085]">
                                {doc.document_type}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="text-[#EF4444] hover:text-[#DC2626] p-1 flex-shrink-0"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              delete
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
      {step === 3 && !showGroupPicker && (
        <div className="flex justify-between mt-6">
          <button onClick={() => setStep(2)} className="btn-secondary">
            Quay lại
          </button>
          <button onClick={() => setStep(4)} className="btn-primary">
            Tiếp tục
          </button>
        </div>
      )}

      {/* Step 4 — Confirmation */}
      {step === 4 && (
        <section className="bg-white rounded-xl border border-[#E4E7EC] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E4E7EC] bg-[#F9FAFB]">
            <h3 className="text-lg font-bold text-[#101828]">
              Kiểm tra & Xác nhận
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-[#101828] mb-3">
                Thông tin cá nhân
              </h4>
              <div className="grid grid-cols-2 gap-4 p-4 bg-[#F9FAFB] rounded-lg">
                <InfoRow label="Họ và tên" value={profileData.full_name} />
                <InfoRow label="Email" value={profileData.email} />
                <InfoRow label="Số điện thoại" value={profileData.phone} />
                <InfoRow label="Ngày sinh" value={profileData.date_of_birth} />
                <InfoRow
                  label="Giới tính"
                  value={
                    profileData.gender === "MALE"
                      ? "Nam"
                      : profileData.gender === "FEMALE"
                        ? "Nữ"
                        : profileData.gender === "OTHER"
                          ? "Khác"
                          : ""
                  }
                />
                <InfoRow label="CMND/CCCD" value={profileData.citizen_id} />
                <div className="col-span-2">
                  <InfoRow label="Địa chỉ" value={profileData.address} />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#101828] mb-3">
                Nguyện vọng
              </h4>
              {wishes.length === 0 ? (
                <p className="text-sm text-[#EF4444]">
                  Chưa có nguyện vọng nào
                </p>
              ) : (
                <div className="space-y-2">
                  {wishes.map((w, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#0EA5E9] text-white text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-[#101828]">
                          {w.university.name} — {w.major.name}
                        </p>
                        <p className="text-xs text-[#667085]">
                          Tổ hợp: {w.combination.code} (
                          {normalizeSubjectName(w.combination.subject_1)},{" "}
                          {normalizeSubjectName(w.combination.subject_2)},{" "}
                          {normalizeSubjectName(w.combination.subject_3)})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {scores.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-[#101828] mb-3">
                  Điểm thi
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-[#F9FAFB] rounded-lg">
                  {scores.map((s) => (
                    <div
                      key={s.subject_code}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-[#667085]">
                        {s.subject_name}
                      </span>
                      <span className="text-sm font-bold text-[#101828]">
                        {s.score || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {documents.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-[#101828] mb-3">
                  Tài liệu đính kèm
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-2 p-3 bg-[#F9FAFB] rounded-lg"
                    >
                      <span className="material-symbols-outlined text-[#0EA5E9] text-[18px]">
                        description
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#101828] truncate">
                          {doc.file_name}
                        </p>
                        <p className="text-[10px] text-[#667085]">
                          {doc.document_type}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-[#E4E7EC] pt-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-[#D0D5DD] text-[#0EA5E9] focus:ring-[#0EA5E9]"
                />
                <span className="text-sm text-[#667085]">
                  Tôi cam đoan những thông tin đã khai báo là đúng sự thật và
                  chịu trách nhiệm trước pháp luật về nội dung đã khai báo. Tôi
                  đồng ý với các điều khoản và chính sách của trường.
                </span>
              </label>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E4E7EC]">
              <button onClick={() => setStep(3)} className="btn-secondary">
                Quay lại
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !agreed || wishes.length === 0}
                className="btn-primary"
              >
                {submitting ? "Đang nộp..." : "Gửi hồ sơ"}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

// Reusable field wrapper
const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-[#344054]">{label}</label>
    {children}
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col">
    <span className="text-xs text-[#667085]">{label}</span>
    <span className="text-sm font-medium text-[#101828]">{value || "—"}</span>
  </div>
);

// Global styles (added once via style tag)
const STYLES = `
.input-base {
  height: 40px;
  padding: 0 12px;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.15s;
  background: white;
  width: 100%;
}
.input-base:focus {
  border-color: #0EA5E9;
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.1);
}
.input-disabled {
  height: 40px;
  padding: 0 12px;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  font-size: 14px;
  background: #F9FAFB;
  color: #667085;
  cursor: not-allowed;
  width: 100%;
}
textarea.input-base {
  height: auto;
  padding: 10px 12px;
}
.btn-primary {
  padding: 10px 24px;
  background: #0EA5E9;
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.15s;
  border: none;
  cursor: pointer;
}
.btn-primary:hover { background: #0095d4; }
.btn-primary:active { transform: scale(0.97); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary {
  padding: 10px 24px;
  background: white;
  color: #344054;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.15s;
  cursor: pointer;
}
.btn-secondary:hover { background: #F9FAFB; }
.btn-secondary:active { transform: scale(0.97); }
select.input-base { appearance: auto; }
`;

const AdmissionsPageWithStyles = () => (
  <>
    <style>{STYLES}</style>
    <AdmissionsPage />
  </>
);

export default AdmissionsPageWithStyles;
