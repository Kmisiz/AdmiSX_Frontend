import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  admissionsApi,
  type Combination,
  type DocumentData,
  type Major,
  type University,
} from "../apis/admissions";
import { profileApi } from "../apis/profile";
import ConfirmDialog from "../components/common/ConfirmDialog";
import DocumentViewer from "../components/common/DocumentViewer";
import Toast from "../components/common/Toast";

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

const OPTIONAL_SUBJECTS: { code: string; name: string }[] = [
  { code: "LY", name: "Vật lý" },
  { code: "HOA", name: "Hóa học" },
  { code: "SINH", name: "Sinh học" },
  { code: "SU", name: "Lịch sử" },
  { code: "DIA", name: "Địa lý" },
  { code: "GDKTPL", name: "GDKT và PL" },
  { code: "TINHOC", name: "Tin học" },
  { code: "CONGNGHE", name: "Công nghệ" },
  { code: "NGOAINGU", name: "Ngoại ngữ" },
];

const FOREIGN_LANGUAGES: { code: string; name: string }[] = [
  { code: "ANH", name: "Tiếng Anh" },
  { code: "HAN", name: "Tiếng Hàn" },
  { code: "NHAT", name: "Tiếng Nhật" },
  { code: "PHAP", name: "Tiếng Pháp" },
  { code: "DUC", name: "Tiếng Đức" },
  { code: "TRUNG", name: "Tiếng Trung" },
  { code: "NGA", name: "Tiếng Nga" },
];

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  TRANSCRIPT: "Bảng điểm",
  CITIZEN_ID_Front: "CMND/CCCD (Mặt trước)",
  CITIZEN_ID_Back: "CMND/CCCD (Mặt sau)",
  PORTRAIT: "Ảnh thẻ",
  CERTIFICATE: "Chứng chỉ khác",
  EXAM_CERTIFICATE: "Giấy chứng nhận kết quả thi",
  OTHER: "Khác",
};

const CERTIFICATE_OPTIONS = [
  "IELTS (Academic)",
  "TOEFL iBT",
  "TOEIC (4 kỹ năng)",
  "DELF/DALF (Tiếng Pháp)",
  "JLPT (Tiếng Nhật)",
  "HSK/HSKK (Tiếng Trung)",
  "TOPIK (Tiếng Hàn)",
  "TestDaF/Goethe-Zertifikat (Tiếng Đức)",
];

const DOCUMENT_TYPES: { value: string; label: string; required: boolean }[] = [
  { value: "TRANSCRIPT", label: "Bảng điểm", required: true },
  { value: "CITIZEN_ID_Front", label: "CMND/CCCD (Mặt trước)", required: true },
  { value: "CITIZEN_ID_Back", label: "CMND/CCCD (Mặt sau)", required: true },
  { value: "PORTRAIT", label: "Ảnh thẻ", required: true },
  {
    value: "EXAM_CERTIFICATE",
    label: "Giấy chứng nhận kết quả thi",
    required: true,
  },
  { value: "CERTIFICATE", label: "Chứng chỉ khác", required: false },
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
                ? "bg-[#032D60] text-white"
                : s === current
                  ? "bg-[#032D60] text-white ring-4 ring-[#032D60]/20"
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
              s < current ? "bg-[#032D60]" : "bg-[#E4E7EC]"
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
    province: string;
    address: string;
    nation: string;
  }>({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    citizen_id: "",
    province: "",
    address: "",
    nation: "",
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
  const [scores, setScores] = useState<ScoreEntry[]>([
    { subject_code: "TOAN", subject_name: "Toán", score: "" },
    { subject_code: "VAN", subject_name: "Ngữ văn", score: "" },
  ]);
  const [selectedOptional, setSelectedOptional] = useState<string[]>([]);
  const [foreignLanguage, setForeignLanguage] = useState("");
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Step 3 — Academic info
  const [graduationYear, setGraduationYear] = useState("");
  const [grade12School, setGrade12School] = useState("");
  const [viewDoc, setViewDoc] = useState<DocumentData | null>(null);
  const [editingDocType, setEditingDocType] = useState<string | null>(null);
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  const [deleteDocTarget, setDeleteDocTarget] = useState<DocumentData | null>(
    null,
  );
  const [deleteWishIndex, setDeleteWishIndex] = useState<number | null>(null);
  const [certEntries, setCertEntries] = useState<string[]>([""]);

  const dismissMessage = useCallback(() => setMessage(null), []);

  useEffect(() => {
    const fetchInitial = async () => {
      let hasError = false;

      // 1. Load profile
      try {
        const profileRes = await profileApi.getProfile();
        const p = profileRes.data.data;
        const cp = p.candidate_profile;
        setProfileData({
          full_name: cp.full_name || "",
          email: p.user?.email || "",
          phone: cp.phone || "",
          date_of_birth: cp.date_of_birth
            ? new Date(cp.date_of_birth).toLocaleDateString("en-CA")
            : "",
          gender: cp.gender || "",
          citizen_id: cp.citizen_id?.toString() || "",
          province: cp.province || "",
          address: cp.address || "",
          nation: cp.nation || "",
        });
      } catch {
        hasError = true;
      }

      // 2. Load universities
      try {
        const uniRes = await admissionsApi.getUniversities();
        setUniversities(uniRes.data.data || []);
      } catch {
        hasError = true;
      }

      // 3. Load applications (có thể fail nếu backend chưa sẵn sàng)
      try {
        const appsRes = await admissionsApi.getApplications({
          page: 1,
          limit: 100,
        });
        const submittedApps = (appsRes.data.data || []).filter(
          (a) => a.submitted_at !== null,
        );
        if (submittedApps.length > 0) {
          setHasSubmitted(true);
        }
      } catch {
        // Applications không critical — bỏ qua, không báo lỗi
      }

      if (hasError) {
        setMessage({ type: "error", text: "Không thể tải thông tin." });
      }
      setLoading(false);
    };
    fetchInitial();
  }, []);

  // Step 1 — save phone, province & address
  const handleStep1Next = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await profileApi.updateProfile({
        full_name: profileData.full_name || null,
        date_of_birth: profileData.date_of_birth || null,
        gender: profileData.gender || null,
        phone: profileData.phone || null,
        province: profileData.province || null,
        address: profileData.address || null,
        nation: profileData.nation || null,
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
    const exists = wishes.some(
      (w) => w.university.id === uni.id && w.major.id === major.id,
    );
    if (exists) {
      setMessage({
        type: "error",
        text: "Nguyện vọng này đã tồn tại. Vui lòng chọn trường/ngành khác.",
      });
      return;
    }
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

  const confirmRemoveWish = (idx: number) => {
    setDeleteWishIndex(idx);
  };

  const removeWish = (idx: number) => {
    setWishes((prev) => prev.filter((_, i) => i !== idx));
    setDeleteWishIndex(null);
  };

  // Step 3 — scores
  useEffect(() => {
    const fetchAcademic = async () => {
      try {
        const res = await profileApi.getAcademicRecord();
        const ar = res.data.data.academic_record;
        const ap = res.data.data.academic_progress;
        if (ar?.graduation_year) {
          setGraduationYear(ar.graduation_year.toString());
        }
        if (ap?.grade_12?.school_name) {
          setGrade12School(ap.grade_12.school_name);
        }
        if (ar?.exam_scores && ar.exam_scores.length > 0) {
          // Load existing scores
          const toanScore = ar.exam_scores.find(
            (s) => s.subject_code === "TOAN",
          );
          const vanScore = ar.exam_scores.find((s) => s.subject_code === "VAN");
          const optionalScores = ar.exam_scores.filter(
            (s) => s.subject_code !== "TOAN" && s.subject_code !== "VAN",
          );

          const newScores: ScoreEntry[] = [
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

          setScores(newScores);
          setSelectedOptional(optionalScores.map((s) => s.subject_code));

          // Check if NGOAINGU is selected
          if (optionalScores.some((s) => s.subject_code === "NGOAINGU")) {
            const lang = ar.foreign_language?.language_code || "";
            setForeignLanguage(lang);
          }
        }
      } catch {
        // no academic record yet
      }
    };
    fetchAcademic();
  }, []);

  const toggleOptionalSubject = (code: string) => {
    setSelectedOptional((prev) => {
      const newSelected = prev.includes(code)
        ? prev.filter((c) => c !== code)
        : prev.length < 2
          ? [...prev, code]
          : prev;

      // Update scores: keep TOAN + VAN, add/remove optional
      setScores((prevScores) => {
        const base: ScoreEntry[] = [
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
        for (const code of newSelected) {
          const def = OPTIONAL_SUBJECTS.find((o) => o.code === code);
          if (def) {
            const existing = prevScores.find((s) => s.subject_code === code);
            base.push({
              subject_code: code,
              subject_name: def.name,
              score: existing?.score || "",
            });
          }
        }
        return base;
      });

      // If NGOAINGU removed, clear foreign language
      if (code === "NGOAINGU" && !newSelected.includes("NGOAINGU")) {
        setForeignLanguage("");
      }

      return newSelected;
    });
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
    displayName?: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      await admissionsApi.uploadDocument(
        file,
        docType,
        displayName,
        setUploadProgress,
      );
      await fetchDocuments();
      if (docType === "CERTIFICATE" && displayName) {
        setCertEntries((prev) => {
          const next = prev.filter((t) => t !== displayName);
          return next.length === 0 ? [""] : next;
        });
      }
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
      setDeleteDocTarget(null);
    } catch {
      setMessage({ type: "error", text: "Xóa file thất bại." });
      setDeleteDocTarget(null);
    }
  };

  const handleReplaceDoc = async (docId: number, docType: string) => {
    if (!newDocFile) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      await admissionsApi.deleteDocument(docId);
      await admissionsApi.uploadDocument(
        newDocFile,
        docType,
        undefined,
        setUploadProgress,
      );
      await fetchDocuments();
      setEditingDocType(null);
      setNewDocFile(null);
    } catch {
      setMessage({ type: "error", text: "Cập nhật file thất bại." });
    } finally {
      setUploading(false);
    }
  };

  // Step 4 — submit
  const handleSubmit = async () => {
    if (hasSubmitted) {
      setMessage({ type: "error", text: "Bạn đã nộp hồ sơ, hãy đợi đợt sau." });
      return;
    }
    if (!agreed) {
      setMessage({ type: "error", text: "Vui lòng đồng ý với điều khoản." });
      return;
    }
    if (wishes.length === 0) {
      setMessage({ type: "error", text: "Chưa có nguyện vọng nào." });
      return;
    }

    // Validate scores: exactly 4 subjects (TOAN + VAN + 2 optional)
    const optionalCount = selectedOptional.length;
    if (optionalCount !== 2) {
      setMessage({
        type: "error",
        text: "Vui lòng chọn đúng 2 môn tự chọn.",
      });
      return;
    }

    // Validate all 4 scores are filled
    const scoreMap: Record<string, number> = {};
    for (const s of scores) {
      if (s.score === "" || isNaN(Number(s.score))) {
        setMessage({
          type: "error",
          text: `Vui lòng nhập điểm môn ${s.subject_name}.`,
        });
        return;
      }
      scoreMap[s.subject_code] = Number(s.score);
    }
    if (Object.keys(scoreMap).length !== 4) {
      setMessage({
        type: "error",
        text: "Cần nhập đầy đủ 4 môn thi.",
      });
      return;
    }

    // Validate foreign language if NGOAINGU selected
    if (selectedOptional.includes("NGOAINGU") && !foreignLanguage) {
      setMessage({
        type: "error",
        text: "Vui lòng chọn ngoại ngữ thi.",
      });
      return;
    }

    // Validate academic info
    if (!graduationYear) {
      setMessage({
        type: "error",
        text: "Vui lòng nhập năm tốt nghiệp THPT.",
      });
      return;
    }
    if (!grade12School) {
      setMessage({
        type: "error",
        text: "Vui lòng nhập tên trường THPT (lớp 12).",
      });
      return;
    }

    // Validate required documents
    const requiredTypes = [
      "TRANSCRIPT",
      "CITIZEN_ID_Front",
      "CITIZEN_ID_Back",
      "PORTRAIT",
      "EXAM_CERTIFICATE",
    ];
    for (const type of requiredTypes) {
      if (!documents.some((d) => d.document_type === type)) {
        const label = DOCUMENT_TYPE_LABELS[type] || type;
        setMessage({
          type: "error",
          text: `Vui lòng tải lên ${label}.`,
        });
        return;
      }
    }

    setSubmitting(true);
    setMessage(null);
    try {
      // 1. Save academic record (graduation_year)
      await profileApi.upsertAcademicRecord({
        graduation_year: parseInt(graduationYear),
      } as never);

      // 2. Save academic progress (grade 12 school name)
      await profileApi.upsertAcademicProgress({
        grade_12: { school_name: grade12School },
      } as never);

      // 3. Upload exam scores (certificate already uploaded via document upload)
      const hasNgoaiNgu = selectedOptional.includes("NGOAINGU");
      await admissionsApi.uploadExamScores(
        scoreMap,
        undefined,
        hasNgoaiNgu ? { language_code: foreignLanguage } : undefined,
      );

      // 5. Create and submit applications
      for (const wish of wishes) {
        const comb = wish.combination;

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
        if (s1 !== undefined) payload.subject_1_score = s1;
        if (s2 !== undefined) payload.subject_2_score = s2;
        if (s3 !== undefined) payload.subject_3_score = s3;

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-[#032D60] animate-spin text-[40px]">
            progress_activity
          </span>
          <p className="text-[#667085] text-sm">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (hasSubmitted) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-9 py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-[64px] text-[#F97316]">
            gavel
          </span>
          <h2 className="text-2xl font-bold text-[#101828] mt-4">
            Bạn đã nộp hồ sơ, hãy đợi đợt sau
          </h2>
          <p className="text-[#667085] text-sm mt-2 max-w-md">
            Mỗi đợt tuyển sinh hệ thống sẽ mở khóa lại để bạn có thể nộp hồ sơ
            mới. Nếu cần hỗ trợ, vui lòng liên hệ văn phòng tuyển sinh.
          </p>
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="mt-6 px-6 py-2.5 bg-[#032D60] text-white rounded-full text-sm font-semibold hover:bg-[#021a40] transition-all active:scale-95"
          >
            Quay lại bảng điều khiển
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-9 py-8">
      <div className="mb-6">
        <h1 className="text-[32px] font-bold text-[#101828]">
          Đăng ký tuyển sinh
        </h1>
        <p className="text-[#667085] text-sm mt-1">
          Hoàn tất các bước để nộp hồ sơ trực tuyến
        </p>
      </div>

      {message && <Toast message={message} onDismiss={dismissMessage} />}

      <Stepper current={step} />

      {/* Step 1 — Personal Info */}
      {step === 1 && (
        <section className="bg-white rounded-2xl border border-[#E4E7EC] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E4E7EC] bg-[#F4F6F9]">
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
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      full_name: e.target.value,
                    }))
                  }
                  className="h-11 px-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none text-sm w-full"
                  placeholder="Nhập họ và tên"
                />
              </Field>
              <Field label="Ngày sinh">
                <input
                  type="date"
                  value={profileData.date_of_birth}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      date_of_birth: e.target.value,
                    }))
                  }
                  className="h-11 px-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none text-sm w-full"
                />
              </Field>
              <Field label="Giới tính">
                <select
                  value={profileData.gender}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      gender: e.target.value,
                    }))
                  }
                  className="h-11 px-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none text-sm w-full"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </Field>
              <Field label="Số CMND/CCCD">
                <input
                  type="text"
                  value={profileData.citizen_id}
                  disabled
                  className="h-11 px-3 border border-[#D0D5DD] rounded-lg bg-[#F4F6F9] text-[#667085] cursor-not-allowed w-full text-sm"
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="h-11 px-3 border border-[#D0D5DD] rounded-lg bg-[#F4F6F9] text-[#667085] cursor-not-allowed w-full text-sm"
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
                  className="h-11 px-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none text-sm w-full"
                  placeholder="Nhập số điện thoại"
                />
              </Field>
              <Field label="Quốc tịch">
                <input
                  type="text"
                  value={profileData.nation}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      nation: e.target.value,
                    }))
                  }
                  className="h-11 px-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none text-sm w-full"
                  placeholder="Nhập quốc tịch"
                />
              </Field>
              <Field label="Tỉnh/Thành phố">
                <input
                  type="text"
                  value={profileData.province}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      province: e.target.value,
                    }))
                  }
                  className="h-11 px-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none text-sm w-full"
                  placeholder="Nhập tỉnh/thành phố"
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
                  className="h-11 px-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none text-sm w-full min-h-[80px] resize-y"
                  placeholder="Nhập địa chỉ"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-between pt-4 border-t border-[#E4E7EC]">
              <button
                onClick={() => navigate({ to: "/dashboard" })}
                className="px-6 py-2.5 bg-white text-[#475467] border border-[#D0D5DD] rounded-full text-sm font-semibold hover:bg-[#F4F6F9] transition-all active:scale-95"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleStep1Next}
                disabled={saving}
                className="px-6 py-2.5 bg-[#032D60] text-white rounded-full text-sm font-semibold hover:bg-[#021a40] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <section className="bg-white rounded-2xl border border-[#E4E7EC] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E4E7EC] bg-[#F4F6F9]">
                <h3 className="text-lg font-bold text-[#101828]">
                  Thêm nguyện vọng
                </h3>
              </div>
              <div className="p-6 space-y-5">
                <Field label="Trường đại học">
                  <select
                    value={selectedUni}
                    onChange={(e) => handleUniChange(e.target.value)}
                    className="h-11 px-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none text-sm w-full"
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
                    className="h-11 px-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none text-sm w-full disabled:bg-[#F4F6F9] disabled:text-[#667085] disabled:cursor-not-allowed"
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
                    className="h-11 px-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none text-sm w-full disabled:bg-[#F4F6F9] disabled:text-[#667085] disabled:cursor-not-allowed"
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
                <button
                  onClick={addWish}
                  className="px-6 py-2.5 bg-[#032D60] text-white rounded-full text-sm font-semibold hover:bg-[#021a40] transition-all active:scale-95 w-full"
                >
                  Thêm vào danh sách
                </button>
              </div>
            </section>
          </div>
          <div className="flex-1 lg:w-7/12">
            <section className="bg-white rounded-2xl border border-[#E4E7EC] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E4E7EC] bg-[#F4F6F9] flex justify-between items-center">
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
                        className="flex items-start gap-3 p-4 border border-[#E4E7EC] rounded-xl hover:bg-[#F4F6F9] transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#032D60]/10 text-[#032D60] flex items-center justify-center text-sm font-bold flex-shrink-0">
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
                          onClick={() => confirmRemoveWish(i)}
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
            <div className="mt-4 p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl">
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
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2.5 bg-white text-[#475467] border border-[#D0D5DD] rounded-full text-sm font-semibold hover:bg-[#F4F6F9] transition-all active:scale-95"
              >
                Quay lại
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2.5 bg-[#032D60] text-white rounded-full text-sm font-semibold hover:bg-[#021a40] transition-all active:scale-95"
              >
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
            <section className="bg-white rounded-2xl border border-[#E4E7EC] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E4E7EC] bg-[#F4F6F9]">
                <h3 className="text-lg font-bold text-[#101828]">
                  Nhập điểm thi THPT
                </h3>
                <p className="text-xs text-[#667085] mt-1">
                  Bắt buộc 2 môn Toán + Văn. Chọn thêm 2 môn tự chọn.
                </p>
              </div>
              <div className="p-6 space-y-6">
                {/* Required subjects */}
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-3">
                    Môn bắt buộc
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {scores
                      .filter(
                        (s) =>
                          s.subject_code === "TOAN" || s.subject_code === "VAN",
                      )
                      .map((s) => {
                        const globalIdx = scores.findIndex(
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
                                updateScore(globalIdx, e.target.value)
                              }
                              className="h-11 px-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none text-sm w-full"
                              placeholder="0.0 - 10.0"
                            />
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Optional subjects */}
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-1">
                    Môn tự chọn{" "}
                    <span className="text-[#667085] font-normal">
                      (Chọn đúng 2)
                    </span>
                  </h4>
                  <p className="text-xs text-[#667085] mb-3">
                    Đã chọn: {selectedOptional.length}/2
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-4">
                    {OPTIONAL_SUBJECTS.map((opt) => {
                      const isSelected = selectedOptional.includes(opt.code);
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
                                ? "bg-[#F4F6F9] text-[#98A2B3] border-[#E4E7EC] cursor-not-allowed"
                                : "bg-white text-[#475467] border-[#D0D5DD] hover:border-[#032D60] hover:text-[#032D60]"
                          }`}
                        >
                          {opt.name}
                        </button>
                      );
                    })}
                  </div>

                  {/* Score inputs for selected optional subjects */}
                  {selectedOptional.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {scores
                        .filter(
                          (s) =>
                            selectedOptional.includes(s.subject_code) &&
                            s.subject_code !== "NGOAINGU",
                        )
                        .map((s) => {
                          const globalIdx = scores.findIndex(
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
                                  updateScore(globalIdx, e.target.value)
                                }
                                className="h-11 px-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none text-sm w-full"
                                placeholder="0.0 - 10.0"
                              />
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {/* Foreign language picker if NGOAINGU selected */}
                  {selectedOptional.includes("NGOAINGU") && (
                    <div className="mt-4 p-3 bg-[#032D60]/5 border border-[#032D60]/20 rounded-xl">
                      <label className="text-xs font-semibold text-[#032D60] mb-2 block">
                        Chọn ngoại ngữ thi *
                      </label>
                      <select
                        value={foreignLanguage}
                        onChange={(e) => {
                          const langCode = e.target.value;
                          setForeignLanguage(langCode);
                          // Replace NGOAINGU in scores with the actual language name
                          if (langCode) {
                            const langDef = FOREIGN_LANGUAGES.find(
                              (l) => l.code === langCode,
                            );
                            if (langDef) {
                              setScores((prev) =>
                                prev.map((s) =>
                                  s.subject_code === "NGOAINGU"
                                    ? {
                                        ...s,
                                        subject_name: langDef.name,
                                      }
                                    : s,
                                ),
                              );
                            }
                          }
                        }}
                        className="h-11 px-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none text-sm w-full"
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

                  {/* Score input for foreign language */}
                  {selectedOptional.includes("NGOAINGU") && foreignLanguage && (
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      {scores
                        .filter((s) => s.subject_code === "NGOAINGU")
                        .map((s) => {
                          const globalIdx = scores.findIndex(
                            (x) => x.subject_code === "NGOAINGU",
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
                                  updateScore(globalIdx, e.target.value)
                                }
                                className="h-11 px-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none text-sm w-full"
                                placeholder="0.0 - 10.0"
                              />
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Academic info */}
                <div className="border-t border-[#E4E7EC] pt-5">
                  <h4 className="text-sm font-bold text-[#101828] mb-4">
                    Thông tin học tập
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#344054]">
                        Năm tốt nghiệp THPT *
                      </label>
                      <input
                        type="number"
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        className="h-11 px-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none text-sm w-full"
                        placeholder="VD: 2025"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#344054]">
                        Trường THPT (lớp 12) *
                      </label>
                      <input
                        type="text"
                        value={grade12School}
                        onChange={(e) => setGrade12School(e.target.value)}
                        className="h-11 px-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none text-sm w-full"
                        placeholder="Tên trường lớp 12"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
          <div className="flex-1 lg:w-5/12">
            <section className="bg-white rounded-2xl border border-[#E4E7EC] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E4E7EC] bg-[#F4F6F9]">
                <h3 className="text-lg font-bold text-[#101828]">
                  Tải lên minh chứng
                </h3>
              </div>
              <div className="p-6 space-y-3">
                {DOCUMENT_TYPES.map((dt) => {
                  const existingDoc = documents.find(
                    (d) => d.document_type === dt.value,
                  );
                  const isEditing = editingDocType === dt.value;
                  const certDocs = documents.filter(
                    (d) => d.document_type === "CERTIFICATE",
                  );

                  // CERTIFICATE type: multiple entries, each with type selector + upload
                  if (dt.value === "CERTIFICATE") {
                    const usedTypes = new Set(
                      documents
                        .filter(
                          (d) =>
                            d.document_type === "CERTIFICATE" && d.display_name,
                        )
                        .map((d) => d.display_name!),
                    );
                    const availableOptions = CERTIFICATE_OPTIONS.filter(
                      (opt) => !usedTypes.has(opt),
                    );
                    return (
                      <div
                        key={dt.value}
                        className="border border-[#E4E7EC] rounded-xl p-4 space-y-3"
                      >
                        <p className="text-sm font-medium text-[#344054]">
                          {dt.label}{" "}
                          <span className="text-[#98A2B3] font-normal">
                            (Tùy chọn)
                          </span>
                        </p>
                        {/* Uploaded certs — cards */}
                        {certDocs.map((cert) => {
                          const isImage =
                            cert.file_type.startsWith("image/") ||
                            /\.(jpg|jpeg|png|gif|webp)$/i.test(cert.file_url);
                          return (
                            <div
                              key={cert.id}
                              className="border border-[#E4E7EC] rounded-xl overflow-hidden"
                            >
                              <div className="bg-[#F9FAFB] p-3">
                                <div className="flex items-center gap-3">
                                  {isImage ? (
                                    <img
                                      src={cert.file_url}
                                      alt={cert.file_name}
                                      className="w-12 h-12 object-cover rounded border border-[#E4E7EC]"
                                    />
                                  ) : (
                                    <span className="material-symbols-outlined text-[28px] text-[#032D60]">
                                      picture_as_pdf
                                    </span>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-[#101828] truncate">
                                      {cert.display_name || cert.file_name}
                                    </p>
                                    <p className="text-[10px] text-[#667085]">
                                      {cert.display_name || cert.file_name}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => setViewDoc(cert)}
                                    className="text-[#032D60] hover:text-[#021a40] flex-shrink-0"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">
                                      open_in_new
                                    </span>
                                  </button>
                                </div>
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => setDeleteDocTarget(cert)}
                                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[#EF4444] border border-[#EF4444] rounded hover:bg-[#FEF2F2] transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">
                                      delete
                                    </span>
                                    Xóa
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {/* Pending entries — pick type + upload */}
                        {certEntries.map((entry, idx) => (
                          <div
                            key={idx}
                            className="border border-dashed border-[#D0D5DD] rounded-xl p-4 text-center hover:border-[#032D60] transition-colors space-y-2"
                          >
                            <select
                              value={entry}
                              onChange={(e) => {
                                const next = [...certEntries];
                                next[idx] = e.target.value;
                                setCertEntries(next);
                              }}
                              className="w-full h-11 px-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-[#032D60]/20 focus:border-[#032D60] outline-none text-sm"
                            >
                              <option value="">-- Loại chứng chỉ --</option>
                              {availableOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                            {entry && (
                              <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-[#032D60] hover:text-[#021a40]">
                                <span className="material-symbols-outlined text-[20px]">
                                  cloud_upload
                                </span>
                                Chọn file
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  className="hidden"
                                  disabled={uploading}
                                  onChange={(e) =>
                                    handleUpload(e, "CERTIFICATE", entry)
                                  }
                                />
                              </label>
                            )}
                            <p className="text-[10px] text-[#667085]">
                              PDF, JPG, PNG tối đa 5MB
                            </p>
                          </div>
                        ))}
                        {/* Add more button */}
                        {certEntries.every((t) => t) &&
                          availableOptions.length > 0 && (
                            <button
                              onClick={() =>
                                setCertEntries([...certEntries, ""])
                              }
                              className="w-full flex items-center justify-center gap-1.5 h-10 border-2 border-dashed border-[#D0D5DD] rounded-xl text-sm text-[#667085] hover:text-[#032D60] hover:border-[#032D60] transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                add
                              </span>
                              Thêm chứng chỉ khác
                            </button>
                          )}
                      </div>
                    );
                  }

                  if (existingDoc && !isEditing) {
                    const isImage =
                      existingDoc.file_type.startsWith("image/") ||
                      /\.(jpg|jpeg|png|gif|webp)$/i.test(existingDoc.file_url);
                    return (
                      <div
                        key={dt.value}
                        className="border border-[#E4E7EC] rounded-xl overflow-hidden"
                      >
                        <div className="bg-[#F9FAFB] p-3">
                          <div className="flex items-center gap-3">
                            {isImage ? (
                              <img
                                src={existingDoc.file_url}
                                alt={existingDoc.file_name}
                                className="w-12 h-12 object-cover rounded border border-[#E4E7EC]"
                              />
                            ) : (
                              <span className="material-symbols-outlined text-[28px] text-[#032D60]">
                                picture_as_pdf
                              </span>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-[#101828] truncate">
                                {existingDoc.document_type === "CERTIFICATE" &&
                                existingDoc.display_name
                                  ? existingDoc.display_name
                                  : existingDoc.file_name}
                              </p>
                              <p className="text-[10px] text-[#667085]">
                                {dt.label}
                              </p>
                            </div>
                            <button
                              onClick={() => setViewDoc(existingDoc)}
                              className="text-[#032D60] hover:text-[#021a40] flex-shrink-0"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                open_in_new
                              </span>
                            </button>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => {
                                setEditingDocType(dt.value);
                                setNewDocFile(null);
                              }}
                              className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[#032D60] border border-[#032D60] rounded hover:bg-[#EFF6FF] transition-colors"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                edit
                              </span>
                              Sửa
                            </button>
                            <button
                              onClick={() => setDeleteDocTarget(existingDoc)}
                              className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[#EF4444] border border-[#EF4444] rounded hover:bg-[#FEF2F2] transition-colors"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                delete
                              </span>
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (isEditing) {
                    return (
                      <div
                        key={dt.value}
                        className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4"
                      >
                        <p className="text-xs text-[#1E40AF] mb-2 font-semibold">
                          {dt.label}
                        </p>
                        <p className="text-xs text-[#1E40AF] mb-2">
                          Chọn file mới:
                        </p>
                        <div className="flex items-center gap-2">
                          <label className="flex-1 flex items-center justify-center gap-2 h-9 px-3 border border-dashed border-[#93C5FD] rounded-lg cursor-pointer hover:border-[#3B82F6] transition-colors bg-white">
                            <span className="material-symbols-outlined text-[16px] text-[#3B82F6]">
                              cloud_upload
                            </span>
                            <span className="text-xs text-[#3B82F6]">
                              {newDocFile ? newDocFile.name : "Chọn file"}
                            </span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setNewDocFile(file);
                              }}
                            />
                          </label>
                          <div className="flex items-center gap-2">
                            {uploading && (
                              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#032D60] rounded-full transition-all duration-200"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            )}
                            <button
                              onClick={() =>
                                handleReplaceDoc(existingDoc!.id, dt.value)
                              }
                              disabled={!newDocFile || uploading}
                              className="h-9 px-3 bg-[#032D60] text-white text-xs font-semibold rounded-lg hover:bg-[#021a40] disabled:opacity-50 transition-colors"
                            >
                              {uploading ? `${uploadProgress}%` : "Lưu"}
                            </button>
                            <button
                              onClick={() => {
                                setEditingDocType(null);
                                setNewDocFile(null);
                              }}
                              className="h-9 px-3 text-xs font-semibold text-[#667085] border border-[#D0D5DD] rounded-lg hover:bg-[#F9FAFB] transition-colors"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={dt.value}
                      className="border border-dashed border-[#D0D5DD] rounded-xl p-4 text-center hover:border-[#032D60] transition-colors"
                    >
                      <p className="text-sm font-medium text-[#344054] mb-2">
                        {dt.label}
                        {dt.required ? (
                          <span className="text-[#EF4444] ml-0.5">*</span>
                        ) : (
                          <span className="text-[#98A2B3] font-normal ml-1">
                            (Tùy chọn)
                          </span>
                        )}
                      </p>
                      <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-[#032D60] hover:text-[#021a40]">
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
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep(2)}
            className="px-6 py-2.5 bg-white text-[#475467] border border-[#D0D5DD] rounded-full text-sm font-semibold hover:bg-[#F4F6F9] transition-all active:scale-95"
          >
            Quay lại
          </button>
          <button
            onClick={() => setStep(4)}
            className="px-6 py-2.5 bg-[#032D60] text-white rounded-full text-sm font-semibold hover:bg-[#021a40] transition-all active:scale-95"
          >
            Tiếp tục
          </button>
        </div>
      )}

      {/* Step 4 — Confirmation */}
      {step === 4 && (
        <section className="bg-white rounded-2xl border border-[#E4E7EC] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E4E7EC] bg-[#F4F6F9]">
            <h3 className="text-lg font-bold text-[#101828]">
              Kiểm tra & Xác nhận
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-[#101828] mb-3">
                Thông tin cá nhân
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F4F6F9] rounded-xl">
                <InfoRow label="Họ và tên" value={profileData.full_name} />
                <InfoRow label="Email" value={profileData.email} />
                <InfoRow label="Số điện thoại" value={profileData.phone} />
                <InfoRow label="Tỉnh/Thành phố" value={profileData.province} />
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
                      className="flex items-center gap-3 p-3 bg-[#F4F6F9] rounded-xl"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#032D60] text-white text-xs flex items-center justify-center font-bold">
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
                  Điểm thi ({scores.length} môn)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-[#F4F6F9] rounded-xl">
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
                {foreignLanguage && (
                  <p className="text-xs text-[#667085] mt-2">
                    Ngoại ngữ:{" "}
                    {FOREIGN_LANGUAGES.find((l) => l.code === foreignLanguage)
                      ?.name || foreignLanguage}
                    {" — "}
                    {scores.find((s) => s.subject_code === "NGOAINGU")?.score ||
                      "—"}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs text-[#667085]">
                  <span>Năm tốt nghiệp: {graduationYear || "—"}</span>
                  <span>Trường lớp 12: {grade12School || "—"}</span>
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
                    <button
                      key={doc.id}
                      onClick={() => setViewDoc(doc)}
                      className="flex items-center gap-2 p-3 bg-[#F4F6F9] rounded-xl text-left hover:bg-[#E4E7EC] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[#032D60] text-[18px]">
                        {doc.file_type === "application/pdf" ||
                        /\.pdf$/i.test(doc.file_url)
                          ? "picture_as_pdf"
                          : "image"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#101828] truncate">
                          {doc.file_name}
                        </p>
                        <p className="text-[10px] text-[#667085]">
                          {doc.document_type === "CERTIFICATE" &&
                          doc.display_name
                            ? doc.display_name
                            : DOCUMENT_TYPE_LABELS[doc.document_type] ||
                              doc.document_type}
                        </p>
                      </div>
                    </button>
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
                  className="mt-1 w-4 h-4 rounded border-[#D0D5DD] text-[#032D60] focus:ring-[#032D60]"
                />
                <span className="text-sm text-[#667085]">
                  Tôi cam đoan những thông tin đã khai báo là đúng sự thật và
                  chịu trách nhiệm trước pháp luật về nội dung đã khai báo. Tôi
                  đồng ý với các điều khoản và chính sách của trường.
                </span>
              </label>
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E4E7EC]">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2.5 bg-white text-[#475467] border border-[#D0D5DD] rounded-full text-sm font-semibold hover:bg-[#F4F6F9] transition-all active:scale-95"
              >
                Quay lại
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !agreed || wishes.length === 0}
                className="px-6 py-2.5 bg-[#032D60] text-white rounded-full text-sm font-semibold hover:bg-[#021a40] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Đang nộp..." : "Gửi hồ sơ"}
              </button>
            </div>
          </div>
        </section>
      )}
      {deleteDocTarget && (
        <ConfirmDialog
          message={`Xóa tài liệu "${deleteDocTarget.file_name}"?`}
          confirmLabel="Xóa"
          danger
          onConfirm={() => handleDeleteDoc(deleteDocTarget.id)}
          onCancel={() => setDeleteDocTarget(null)}
        />
      )}
      {deleteWishIndex !== null && (
        <ConfirmDialog
          message="Xóa nguyện vọng này?"
          confirmLabel="Xóa"
          danger
          onConfirm={() => removeWish(deleteWishIndex)}
          onCancel={() => setDeleteWishIndex(null)}
        />
      )}
      {viewDoc && (
        <DocumentViewer
          fileUrl={viewDoc.file_url}
          fileType={viewDoc.file_type}
          fileName={viewDoc.file_name}
          onClose={() => setViewDoc(null)}
        />
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

export default AdmissionsPage;
