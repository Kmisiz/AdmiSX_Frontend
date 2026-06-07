import type { NationalityOption } from "../../apis/nationalities";

interface NationalitySelectProps {
  value: string;
  options: NationalityOption[];
  loading?: boolean;
  error?: boolean;
  className?: string;
  onChange: (value: string) => void;
}

const NationalitySelect = ({
  value,
  options,
  loading,
  error,
  className,
  onChange,
}: NationalitySelectProps) => {
  const hasCurrentValue =
    value && !options.some((option) => option.value === value);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
      className={className}
    >
      <option value="">
        {loading ? "Đang tải quốc tịch..." : "Chọn quốc tịch"}
      </option>
      {hasCurrentValue && <option value={value}>{value}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
      {error && options.length === 0 && (
        <option value="" disabled>
          Không tải được danh sách
        </option>
      )}
    </select>
  );
};

export default NationalitySelect;
