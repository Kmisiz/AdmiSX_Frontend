# Admissions System

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
  <img src="https://img.shields.io/badge/TanStack%20Router-FF4154?style=for-the-badge&logo=reactrouter&logoColor=white" alt="TanStack Router" />
  <img src="https://img.shields.io/badge/TanStack%20Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="TanStack Query" />
  <br/>
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios" />
  <img src="https://img.shields.io/badge/Ant%20Design-0170FE?style=for-the-badge&logo=antdesign&logoColor=white" alt="Ant Design" />
  <img src="https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=zustand&logoColor=white" alt="Zustand" />
  <img src="https://img.shields.io/badge/React%20Hook%20Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white" alt="React Hook Form" />
  <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" />
  <img src="https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint" />
  <img src="https://img.shields.io/badge/Husky-1B2A33?style=for-the-badge&logo=git&logoColor=white" alt="Husky" />
  <img src="https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black" alt="Prettier" />
</p>

Hệ thống quản lý tuyển sinh hiện đại xây dựng với **React 19**, **TypeScript**, **Vite**, **Ant Design** và real-time notifications qua **Socket.IO**. Kết nối với backend **AdmiSX** tại `qldangkytuyensinh.up.railway.app`.

## Công nghệ sử dụng

| Công nghệ           | Mục đích                                            |
| ------------------- | --------------------------------------------------- |
| **React 19**        | Thư viện UI                                         |
| **TypeScript**      | Ngôn ngữ lập trình với kiểu tĩnh                    |
| **Vite 8**          | Build tool & dev server                             |
| **pnpm**            | Package manager                                     |
| **TanStack Router** | Quản lý routing & điều hướng                        |
| **TanStack Query**  | Quản lý server state, caching & đồng bộ dữ liệu     |
| **Axios**           | HTTP client (gọi API)                               |
| **Ant Design**      | UI component library                                |
| **Zustand**         | Quản lý state (ứng dụng nhẹ, đơn giản)              |
| **React Hook Form** | Quản lý form & validation                           |
| **Zod**             | Schema validation (dữ liệu form & API)              |
| **Socket.IO**       | Real-time notifications & cập nhật trạng thái hồ sơ |
| **ESLint**          | Linting & kiểm tra chất lượng code                  |
| **Prettier**        | Format code tự động                                 |
| **Husky**           | Git hooks (tự động chạy lint/format trước commit)   |
| **lint-staged**     | Chạy lint-staged trên file thay đổi khi commit      |
| **React Compiler**  | Tối ưu hiệu năng qua `babel-plugin-react-compiler`  |

## Cấu trúc thư mục

```
src/
├── apis/          # Định nghĩa các API request (axios instances, endpoints)
├── assets/        # Tài nguyên tĩnh (hình ảnh, icon, v.v.)
├── components/    # Component UI tái sử dụng
│   ├── common/    # Component dùng chung (button, input, v.v.)
│   └── layout/    # Component bố cục (header, sidebar, footer, v.v.)
├── configs/       # Cấu hình ứng dụng
├── constants/     # Hằng số dùng trong toàn bộ ứng dụng
├── hooks/         # Custom React hooks
├── layouts/       # Layout bao bọc các trang
├── locales/       # File dịch đa ngôn ngữ (i18n)
├── pages/         # Component trang / module theo route
├── routes/        # Định nghĩa và cấu hình route (TanStack Router)
├── services/      # Logic nghiệp vụ / tầng service
├── store/         # Quản lý state (Zustand stores)
├── types/         # Định nghĩa kiểu dữ liệu TypeScript & interface
├── utils/         # Hàm tiện ích / helper
└── validations/   # Schema validate (Zod schemas)
```

## Bắt đầu

### Yêu cầu

- **Node.js** >= 18
- **pnpm** (cài đặt toàn cục: `npm i -g pnpm`)

### Cài đặt

```bash
pnpm install
```

### Chạy môi trường phát triển

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Xem trước bản build

```bash
pnpm preview
```

### Kiểm tra mã nguồn

```bash
pnpm lint
```

### Format code

```bash
pnpm format
```

## Scripts

| Lệnh           | Mô tả                                            |
| -------------- | ------------------------------------------------ |
| `pnpm dev`     | Khởi động Vite dev server                        |
| `pnpm build`   | Kiểm tra kiểu và build production                |
| `pnpm preview` | Xem trước bản production build                   |
| `pnpm lint`    | Chạy ESLint trên toàn bộ dự án                   |
| `pnpm format`  | Format code với Prettier                         |
| `pnpm prepare` | Kích hoạt Husky hooks (chạy tự động khi cài đặt) |

## Git Hooks (Husky)

Dự án sử dụng **Husky** kết hợp **lint-staged** để tự động kiểm tra chất lượng code trước mỗi lần commit:

- **pre-commit**: Chạy `lint-staged` để tự động:
  - `eslint --fix` trên file `.ts`, `.tsx`
  - `prettier --write` trên file `.ts`, `.tsx`, `.json`, `.css`, `.md`

Cơ chế này giúp đảm bảo code luôn sạch, đúng chuẩn trước khi được commit lên repository.

## Triển khai

| Môi trường     | URL                                                                  |
| -------------- | -------------------------------------------------------------------- |
| **Production** | [https://system-admisx.vercel.app](https://system-admisx.vercel.app) |

## Tính năng

### 🔐 Xác thực & Bảo mật

- Đăng nhập / đăng xuất qua JWT, tự động xử lý token từ URL
- Bảo vệ route, tự động redirect khi token hết hạn
- Avatar upload / xóa

### 📝 Nộp hồ sơ tuyển sinh (5 bước)

1. **Thông tin cá nhân** — Họ tên, ngày sinh, CCCD, địa chỉ, dân tộc, quốc tịch
2. **Xác thực eKYC** — Upload CCCD mặt trước/sau + ảnh chân dung, xác thực qua FPT OCR
3. **Chọn nguyện vọng** — Chọn trường → ngành → tổ hợp xét tuyển
4. **Nhập điểm & minh chứng** — Điểm thi, học bạ, chứng chỉ, upload tài liệu
5. **Xem lại & nộp** — Tổng quan hồ sơ trước khi gửi

### 📄 Quản lý hồ sơ thí sinh

- Dashboard với tiến độ hoàn thiện hồ sơ, deadline đếm ngược
- Quản lý thông tin cá nhân, học bạ, điểm thi
- Upload / xóa chứng chỉ, minh chứng (Cloudinary)
- Đổi mật khẩu

### 🔔 Thông báo real-time

- Nhận thông báo khi trạng thái hồ sơ thay đổi (Socket.IO)
- Danh sách thông báo phân trang, đánh dấu đã đọc

### 📑 Quản lý tài liệu

- Xem danh sách tài liệu đã upload, filter theo trạng thái
- Hướng dẫn upload chi tiết kèm hình ảnh minh họa

## Giấy phép

[MIT](LICENSE)
.
...
