# Skill: Phase 2 - Authentication (Xác Thực)

> **Đọc `skills/conventions.md` trước. Hoàn thành Phase 1 trước khi bắt đầu.**

---

## Mục Tiêu
Xây dựng hệ thống xác thực hoàn chỉnh: đăng ký, đăng nhập, JWT tokens, phân quyền, profile.

---

## BACKEND (NestJS) - Làm trước

### Bước 2.1: PrismaService cho Backend

Tạo `apps/api/src/prisma/prisma.module.ts` và `prisma.service.ts`:

```typescript
// prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from 'database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

```typescript
// prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

Import `PrismaModule` trong `AppModule`.

### Bước 2.2: Auth Module

Tạo cấu trúc:
```
apps/api/src/modules/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── strategies/
│   └── jwt.strategy.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
├── decorators/
│   ├── current-user.decorator.ts
│   └── roles.decorator.ts
└── dto/
    ├── login.dto.ts
    └── register.dto.ts
```

### API Endpoints:

```
POST   /api/v1/auth/register   → Đăng ký (public)
POST   /api/v1/auth/login      → Đăng nhập (public)
POST   /api/v1/auth/refresh    → Refresh token (public)
POST   /api/v1/auth/logout     → Đăng xuất (authenticated)
GET    /api/v1/auth/me         → Lấy thông tin user hiện tại (authenticated)
```

### Controller mẫu:
```typescript
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser() user: User) {
    return this.authService.logout(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: User) {
    return { data: user };
  }
}
```

### Service logic:
```typescript
@Injectable()
export class AuthService {
  // register: hash password → create user → return user (no tokens)
  // login: find user → compare password → generate tokens → return { user, tokens }
  // refreshTokens: verify refresh token → generate new pair → return tokens
  // logout: (optional) invalidate refresh token
}
```

### JWT Strategy:
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true, avatar: true },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
```

### Roles Guard:
```typescript
// roles.decorator.ts
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

### Bước 2.3: Users Module

```
apps/api/src/modules/users/
├── users.module.ts
├── users.controller.ts
├── users.service.ts
└── dto/
    └── update-user.dto.ts
```

API Endpoints:
```
GET    /api/v1/users/me              → Profile (authenticated)
PATCH  /api/v1/users/me              → Update profile (authenticated)
POST   /api/v1/users/me/addresses    → Add address (authenticated)
GET    /api/v1/users/me/addresses    → List addresses (authenticated)
PATCH  /api/v1/users/me/addresses/:id → Update address (authenticated)
DELETE /api/v1/users/me/addresses/:id → Delete address (authenticated)
```

### Bước 2.4: Test Backend

```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","name":"Test User"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Get profile (dùng token từ login)
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <token>"
```

---

## FRONTEND (Next.js) - Làm sau khi backend xong

### Bước 2.5: API Client

Tạo `apps/web/lib/api-client.ts`:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private accessToken: string | null = null;

  setToken(token: string | null) {
    this.accessToken = token;
  }

  async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Something went wrong');
    }

    return res.json();
  }
}

export const apiClient = new ApiClient();
```

### Bước 2.6: Auth Store (Zustand)

Tạo `apps/web/stores/auth-store.ts`:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens } from 'shared-types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  setAuth: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      setAuth: (user, tokens) => set({ user, tokens, isAuthenticated: true }),
      logout: () => set({ user: null, tokens: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
```

### Bước 2.7: Trang Đăng Nhập

Tạo `apps/web/app/(auth)/login/page.tsx`:
- Form với shadcn: Input email, Input password, Button submit
- Validate với Zod (import từ shared-utils)
- Gọi API `/auth/login`
- Lưu tokens vào Zustand store
- Redirect về homepage

### Bước 2.8: Trang Đăng Ký

Tạo `apps/web/app/(auth)/register/page.tsx`:
- Form: name, email, phone (optional), password, confirm password
- Validate với Zod
- Gọi API `/auth/register`
- Redirect về login page

### Bước 2.9: Layout Auth

Tạo `apps/web/app/(auth)/layout.tsx`:
- Layout centered, card-based design
- Logo ở trên, form ở dưới
- Link chuyển đổi login ↔ register

### Bước 2.10: Header Component

Tạo `apps/web/components/layout/header.tsx`:
- Logo bên trái
- Navigation links giữa
- Bên phải: Search icon, Cart icon (badge), User dropdown
- User dropdown: nếu đã login → Profile, Orders, Logout; nếu chưa → Login, Register

### Bước 2.11: Middleware Bảo Vệ Routes

Tạo `apps/web/middleware.ts`:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protected routes
  const protectedPaths = ['/profile', '/orders', '/checkout'];
  const adminPaths = ['/admin'];
  
  // Check auth from cookie or header
  // Redirect to /login if not authenticated
  // Redirect to / if accessing admin without admin role
}

export const config = {
  matcher: ['/profile/:path*', '/orders/:path*', '/checkout/:path*', '/admin/:path*'],
};
```

### Bước 2.12: Profile Page

Tạo `apps/web/app/(shop)/profile/page.tsx`:
- Hiển thị thông tin user
- Form chỉnh sửa name, phone, avatar
- Tab addresses: list, add, edit, delete

---

## ✅ Checkpoint Kiểm Tra

### Backend:
- [ ] `POST /auth/register` → Tạo user mới, trả về user info
- [ ] `POST /auth/login` → Trả về accessToken + refreshToken
- [ ] `GET /auth/me` với Bearer token → Trả về user info
- [ ] `POST /auth/refresh` → Trả về token mới
- [ ] Roles guard hoạt động (ADMIN vs CUSTOMER)

### Frontend:
- [ ] Trang `/login` hiển thị form đẹp, validate input
- [ ] Trang `/register` hiển thị form, tạo tài khoản thành công
- [ ] Sau login → redirect về homepage, header hiển thị user info
- [ ] Trang `/profile` hiển thị và sửa được thông tin
- [ ] Truy cập protected route khi chưa login → redirect `/login`
- [ ] Logout → xóa token, redirect về homepage

## ⚠️ Lưu Ý

1. **Password KHÔNG BAO GIỜ trả về trong response** - Dùng `select` trong Prisma
2. **Refresh token nên lưu trong httpOnly cookie** cho production
3. **Validation chạy ở CẢ 2 phía** - Zod schemas import từ shared-utils
4. **Error messages hiển thị bằng Toast** - Dùng shadcn toast component
5. **Loading state** - Disable button, show spinner khi đang gọi API
