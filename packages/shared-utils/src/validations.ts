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

export const productSchema = z.object({
  name: z.string().min(3, 'Tên sản phẩm tối thiểu 3 ký tự'),
  description: z.string().min(10, 'Mô tả tối thiểu 10 ký tự'),
  price: z.coerce.number().min(0, 'Giá không hợp lệ'),
  stock: z.coerce.number().min(0, 'Tồn kho không hợp lệ'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  status: z.enum(['active', 'draft', 'out']),
  sku: z.string().optional(),
  images: z.array(z.string()).optional(),
  attributes: z.array(z.object({
    name: z.string(),
    values: z.array(z.string())
  })).optional(),
  variants: z.array(z.object({
    name: z.string(),
    sku: z.string(),
    price: z.coerce.number(),
    stock: z.coerce.number(),
    image: z.string().optional(),
    options: z.any()
  })).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Tên danh mục tối thiểu 2 ký tự'),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional().nullable(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
