# Skill: Phase 1 - Khởi Tạo Dự Án & Cấu Hình

> **Đọc `skills/conventions.md` trước khi bắt đầu phase này.**

---

## Mục Tiêu
Setup monorepo hoàn chỉnh với Turborepo + pnpm, tạo apps (Next.js 16 + NestJS 11), shared packages, Prisma, shadcn/ui.

## Điều Kiện Tiên Quyết
- Node.js 20+ đã cài
- pnpm đã cài (`npm install -g pnpm`)
- PostgreSQL đã chạy (hoặc dùng Docker)
- Workspace: `c:\Users\Administrator\Desktop\TestNext`

---

## Bước 1.1: Khởi Tạo Monorepo

```bash
cd c:\Users\Administrator\Desktop\TestNext

# Khởi tạo pnpm workspace
pnpm init

# Tạo cấu trúc thư mục
mkdir -p apps packages/shared-types packages/shared-utils packages/database
```

Tạo file `pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

Tạo file `turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    }
  }
}
```

Cài Turborepo:
```bash
pnpm add -D turbo -w
```

## Bước 1.2: Tạo Next.js Frontend

```bash
# Kiểm tra options trước
npx -y create-next-app@latest --help

# Tạo app (non-interactive)
npx -y create-next-app@latest apps/web --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-pnpm
```

Sau khi tạo xong, sửa `apps/web/package.json`:
```json
{
  "name": "web",
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## Bước 1.3: Tạo NestJS Backend

```bash
# Kiểm tra options
npx -y @nestjs/cli@latest new --help

# Tạo app
npx -y @nestjs/cli@latest new apps/api --package-manager pnpm --strict --skip-git
```

Sửa `apps/api/package.json` - thêm name và sửa port:
```json
{
  "name": "api"
}
```

Sửa `apps/api/src/main.ts`:
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global prefix
  app.setGlobalPrefix('api/v1');
  
  // CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  
  await app.listen(8000);
  console.log('🚀 API running on http://localhost:8000/api/v1');
}
bootstrap();
```

## Bước 1.4: Setup Shared Packages

### packages/shared-types/package.json
```json
{
  "name": "shared-types",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "echo 'no lint configured'"
  }
}
```

### packages/shared-types/src/index.ts
```typescript
// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Error response
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  details?: unknown[];
  timestamp: string;
}

// User
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'STAFF';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
```

### packages/shared-utils/package.json
```json
{
  "name": "shared-utils",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "zod": "^3.23.0"
  },
  "scripts": {
    "lint": "echo 'no lint configured'"
  }
}
```

### packages/shared-utils/src/index.ts
```typescript
export * from './formatters';
export * from './validations';
```

### packages/shared-utils/src/formatters.ts
```typescript
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
```

### packages/shared-utils/src/validations.ts
```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

export const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  phone: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
```

## Bước 1.5: Setup Prisma (packages/database)

### packages/database/package.json
```json
{
  "name": "database",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "lint": "echo 'no lint configured'"
  },
  "dependencies": {
    "@prisma/client": "^6.0.0"
  },
  "devDependencies": {
    "prisma": "^6.0.0",
    "tsx": "^4.0.0"
  }
}
```

### packages/database/tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "./dist",
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

### packages/database/src/index.ts
```typescript
export { PrismaClient } from '@prisma/client';
export type * from '@prisma/client';
```

Tạo Prisma schema tại `packages/database/prisma/schema.prisma` - copy từ IMPLEMENTATION_PLAN.md (phần Database Schema).

## Bước 1.6: Cài shadcn/ui

```bash
cd apps/web

# Init shadcn
npx shadcn@latest init -d

# Cài components cơ bản
npx shadcn@latest add button input label card form toast dropdown-menu avatar sheet dialog
```

## Bước 1.7: Cài Dependencies

```bash
# Quay về root
cd c:\Users\Administrator\Desktop\TestNext

# Cài Lucide React cho frontend
pnpm add lucide-react --filter web

# Cài Zustand cho frontend
pnpm add zustand --filter web

# Cài deps cho backend
pnpm add @nestjs/config @nestjs/passport passport passport-jwt @nestjs/jwt bcrypt class-validator class-transformer --filter api
pnpm add -D @types/passport-jwt @types/bcrypt --filter api

# Cài Zod ở root (shared)
pnpm add zod -w

# Cài tất cả
pnpm install
```

## Bước 1.8: Cấu Hình Environment

### Root `.env.example`
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/ecommerce?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-this"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# App
API_PORT=8000
WEB_PORT=3000
API_URL=http://localhost:8000
```

Copy thành `.env` và điền giá trị thật.

## Bước 1.9: Cấu Hình Root Scripts

Sửa root `package.json`:
```json
{
  "name": "ecommerce-monorepo",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "db:generate": "pnpm --filter database db:generate",
    "db:push": "pnpm --filter database db:push",
    "db:migrate": "pnpm --filter database db:migrate",
    "db:seed": "pnpm --filter database db:seed",
    "db:studio": "pnpm --filter database db:studio"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

## Bước 1.10: Verify

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Chạy cả 2 apps
pnpm dev
```

## ✅ Checkpoint Kiểm Tra

- [ ] `http://localhost:3000` → Trang Next.js mặc định
- [ ] `http://localhost:8000/api/v1` → NestJS response `Hello World!`
- [ ] Prisma Studio mở được (`pnpm db:studio`)
- [ ] Không có lỗi TypeScript
- [ ] shadcn components import được trong Next.js

## ⚠️ Troubleshooting

| Lỗi | Giải pháp |
|---|---|
| `pnpm install` lỗi peer deps | Thêm `.npmrc` với `strict-peer-dependencies=false` |
| Prisma generate lỗi | Chắc chắn DATABASE_URL đúng, PostgreSQL đang chạy |
| Turbo dev chỉ chạy 1 app | Kiểm tra `pnpm-workspace.yaml` và tên package |
| shadcn init lỗi | Chắc chắn đang ở thư mục `apps/web` |
| Port conflict | Đổi port trong `main.ts` (NestJS) hoặc `next dev --port` |
