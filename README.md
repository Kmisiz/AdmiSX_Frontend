# Cổng Tuyển Sinh Đại Học Trực Tuyến

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
  <img src="https://img.shields.io/badge/Ant%20Design-0170FE?style=for-the-badge&logo=antdesign&logoColor=white" alt="Ant Design" />
  <img src="https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.IO" />
</p>

Ứng dụng này là **Cổng tuyển sinh đại học trực tuyến** dành cho thí sinh, cho phép đăng ký nguyện vọng, nộp hồ sơ, cập nhật trạng thái, và nhận thông báo real-time.

## Tổng quan

- Nền tảng UI xây dựng bằng **React 19** và **TypeScript**
- Sử dụng **Vite** cho môi trường phát triển nhanh và trải nghiệm build tốt
- Giao diện được thiết kế với **Ant Design**
- Kết nối tới backend tuyển sinh để quản lý hồ sơ thí sinh, nguyện vọng và thông báo
- Hỗ trợ **real-time notification** bằng **Socket.IO**

## Tính năng chính

- Đăng ký / đăng nhập thí sinh
- Bổ sung thông tin cá nhân và hồ sơ tuyển sinh
- Xác thực eKYC bằng hình ảnh CCCD và ảnh chân dung
- Chọn ngành, trường, tổ hợp xét tuyển
- Upload tài liệu minh chứng, học bạ, chứng chỉ
- Dashboard theo dõi tiến độ hồ sơ và trạng thái duyệt
- Nhận thông báo trực tiếp khi hồ sơ thay đổi

## Công nghệ sử dụng

| Công nghệ           | Mục đích                                      |
| ------------------- | --------------------------------------------- |
| **React 19**        | Xây dựng giao diện người dùng                 |
| **TypeScript**      | Kiểm tra kiểu tĩnh và tăng độ an toàn code    |
| **Vite**            | Dev server nhanh và build production          |
| **pnpm**            | Quản lý package                               |
| **Ant Design**      | Thư viện component UI                         |
| **Axios**           | Gọi API tới backend                           |
| **Socket.IO**       | Thông báo real-time                           |
| **Zustand**         | Quản lý state ứng dụng                        |
| **React Hook Form** | Quản lý form và validation                    |
| **Zod**             | Validate dữ liệu form                         |
| **ESLint**          | Kiểm tra chất lượng code                      |
| **Prettier**        | Định dạng code tự động                        |
| **Husky**           | Git hooks để kiểm tra trước commit            |
| **lint-staged**     | Chạy kiểm tra trên file thay đổi trước commit |

## Cấu trúc thư mục

```
src/
├── apis/          # Định nghĩa các API request
├── assets/        # Hình ảnh, icon và tài nguyên tĩnh
├── components/    # Component UI tái sử dụng
│   ├── common/    # Component dùng chung
│   └── layout/    # Component bố cục
├── configs/       # Cấu hình ứng dụng
├── constants/     # Hằng số dùng chung
├── hooks/         # Custom hooks
├── layouts/       # Layout chính cho trang
├── locales/       # File đa ngôn ngữ
├── pages/         # Các trang chính của ứng dụng
├── routes/        # Định nghĩa route
├── services/      # Logic nghiệp vụ
├── store/         # Zustand store
├── types/         # Kiểu dữ liệu TypeScript
├── utils/         # Hàm tiện ích
└── validations/   # Schema validation (Zod)
```

## Cài đặt

### Yêu cầu

- Node.js >= 18
- pnpm (cài đặt: `npm i -g pnpm`)

### Thực hiện

```bash
pnpm install
```

## Chạy ứng dụng

```bash
pnpm dev
```

## Build production

```bash
pnpm build
```

## Xem trước production

```bash
pnpm preview
```

## Kiểm tra mã nguồn

```bash
pnpm lint
```

## Định dạng code

```bash
pnpm format
```

## Scripts

| Lệnh           | Mô tả                         |
| -------------- | ----------------------------- |
| `pnpm dev`     | Chạy dev server               |
| `pnpm build`   | Build ứng dụng cho production |
| `pnpm preview` | Xem trước bản production      |
| `pnpm lint`    | Kiểm tra code với ESLint      |
| `pnpm format`  | Định dạng code với Prettier   |
| `pnpm prepare` | Kích hoạt Husky hooks         |

## Triển khai

| Môi trường | URL                                                    |
| ---------- | ------------------------------------------------------ |
| Production | [https://admisx.vercel.app](https://admisx.vercel.app) |

## Backend liên quan

Cổng tuyển sinh này kết nối với backend và admin panel tại repository:

- [https://github.com/TuanLe06/RIPT1307-02-2026-Nhom10-KTHP](https://github.com/TuanLe06/RIPT1307-02-2026-Nhom10-KTHP)

## Giấy phép

[MIT](LICENSE)
.
...
