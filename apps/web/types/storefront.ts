export type ProductImage = {
  id?: string;
  url: string;
  alt?: string | null;
  position?: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  parent?: Category | null;
  children?: Category[];
  _count?: {
    products?: number;
  };
};

export type ProductVariant = {
  id: string;
  name: string;
  sku: string;
  price: string | number;
  stock: number;
  image?: string | null;
  options?: Record<string, string>;
};

export type Review = {
  id?: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  user?: {
    name: string;
    avatar?: string | null;
  };
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string | number;
  salePrice?: string | number | null;
  sku?: string;
  stock: number;
  images: ProductImage[];
  category?: Category | null;
  variants?: ProductVariant[];
  reviews?: Review[];
  averageRating?: number;
  reviewCount?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  attributes?: unknown;
  createdAt?: string;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ProductListResponse = {
  data: Product[];
  meta: PaginationMeta;
};

export type CategoryProductResponse = {
  data: Category & {
    products: Product[];
  };
  meta: PaginationMeta;
};

export type ProductQuery = {
  page?: string;
  limit?: string;
  sort?: string;
  order?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  rating?: string;
};
