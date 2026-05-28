import type {
  Category,
  CategoryProductResponse,
  Product,
  ProductListResponse,
  ProductQuery,
} from "@/types/storefront";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const demoCategories: Category[] = [
  {
    id: "cat-chan-ga",
    name: "Bộ chăn ga",
    slug: "bo-chan-ga",
    description: "Bộ chăn ga phối sẵn cho phòng ngủ hiện đại.",
    image: "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=900&q=80",
    _count: { products: 18 },
  },
  {
    id: "cat-dem",
    name: "Đệm & nệm",
    slug: "dem-nem",
    description: "Nệm êm, thoáng khí cho giấc ngủ sâu.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    _count: { products: 12 },
  },
  {
    id: "cat-goi",
    name: "Gối",
    slug: "goi",
    description: "Gối ngủ, gối ôm và phụ kiện nâng đỡ.",
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=900&q=80",
    _count: { products: 24 },
  },
  {
    id: "cat-chan",
    name: "Chăn",
    slug: "chan",
    description: "Chăn hè, chăn đông và chăn lông vũ.",
    image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?auto=format&fit=crop&w=900&q=80",
    _count: { products: 16 },
  },
];

const demoProducts: Product[] = [
  {
    id: "prd-1",
    name: "Bộ chăn ga Cotton Sateen Lumina 500TC",
    slug: "bo-chan-ga-cotton-sateen-lumina-500tc",
    description:
      "Bề mặt cotton sateen mềm mịn, thoáng khí và có độ rũ sang trọng. Phù hợp phòng ngủ master cần cảm giác khách sạn tại nhà.",
    price: 1890000,
    salePrice: 1590000,
    stock: 24,
    category: demoCategories[0],
    images: [
      {
        url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80",
        alt: "Bộ chăn ga cotton sateen màu trắng",
      },
      {
        url: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1200&q=80",
        alt: "Phòng ngủ với ga trải giường sáng màu",
      },
    ],
    variants: [
      { id: "v1", name: "1m6 x 2m - Trắng ngà", sku: "LUM-500-WH", price: 1590000, stock: 10, options: { size: "1m6 x 2m", color: "Trắng ngà" } },
      { id: "v2", name: "1m8 x 2m - Xanh sương", sku: "LUM-500-BL", price: 1690000, stock: 14, options: { size: "1m8 x 2m", color: "Xanh sương" } },
    ],
    averageRating: 4.8,
    reviewCount: 126,
    isFeatured: true,
    tags: ["Cotton 500TC", "Bán chạy"],
  },
  {
    id: "prd-2",
    name: "Nệm Foam Hybrid Cloud Rest",
    slug: "nem-foam-hybrid-cloud-rest",
    description:
      "Cấu trúc foam đàn hồi kết hợp lớp nâng đỡ ổn định, giảm truyền động khi xoay người và giữ lưng thẳng tự nhiên.",
    price: 5490000,
    salePrice: 4890000,
    stock: 8,
    category: demoCategories[1],
    images: [
      {
        url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
        alt: "Nệm foam hybrid trong phòng ngủ",
      },
      {
        url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
        alt: "Nệm phòng ngủ hiện đại",
      },
    ],
    averageRating: 4.7,
    reviewCount: 84,
    isFeatured: true,
    tags: ["Hybrid", "Sale"],
  },
  {
    id: "prd-3",
    name: "Gối Memory Foam nâng đỡ cổ",
    slug: "goi-memory-foam-nang-do-co",
    description:
      "Form gối công thái học giúp nâng đỡ vùng cổ vai, vỏ gối tháo rời dễ giặt và bề mặt mát khi nằm.",
    price: 690000,
    stock: 42,
    category: demoCategories[2],
    images: [
      {
        url: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1200&q=80",
        alt: "Gối memory foam màu trắng",
      },
      {
        url: "https://images.unsplash.com/photo-1567016526105-22da7c13161a?auto=format&fit=crop&w=1200&q=80",
        alt: "Gối trên giường ngủ",
      },
    ],
    averageRating: 4.6,
    reviewCount: 211,
    tags: ["Memory Foam", "Mới"],
  },
  {
    id: "prd-4",
    name: "Chăn hè Bamboo Airy Quilt",
    slug: "chan-he-bamboo-airy-quilt",
    description:
      "Chăn hè sợi bamboo nhẹ, mát và ít bám mùi. Đường chần chắc chắn, phù hợp khí hậu nóng ẩm.",
    price: 1190000,
    salePrice: 990000,
    stock: 31,
    category: demoCategories[3],
    images: [
      {
        url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
        alt: "Chăn hè bamboo trên giường",
      },
      {
        url: "https://images.unsplash.com/photo-1598928636135-d146006ff4be?auto=format&fit=crop&w=1200&q=80",
        alt: "Chăn mỏng màu sáng",
      },
    ],
    averageRating: 4.9,
    reviewCount: 57,
    isFeatured: true,
    tags: ["Bamboo", "Thoáng mát"],
  },
];

function toQueryString(query: ProductQuery) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });

  return params.toString();
}

type FetchJsonOptions = {
  revalidate?: number;
  tags?: string[];
};

async function fetchJson<T>(
  endpoint: string,
  fallback: T,
  options: FetchJsonOptions = {},
): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: { Accept: "application/json" },
      next: {
        revalidate: options.revalidate ?? 60,
        tags: options.tags,
      },
    });

    if (!response.ok) {
      return fallback;
    }

    return response.json();
  } catch {
    return fallback;
  }
}

function filterDemoProducts(query: ProductQuery): ProductListResponse {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Number(query.limit) || 12);
  let products = [...demoProducts];

  if (query.search) {
    const keyword = query.search.toLowerCase();
    products = products.filter((product) => product.name.toLowerCase().includes(keyword));
  }

  if (query.category) {
    products = products.filter((product) => product.category?.slug === query.category);
  }

  if (query.minPrice) {
    products = products.filter((product) => Number(product.salePrice || product.price) >= Number(query.minPrice));
  }

  if (query.maxPrice) {
    products = products.filter((product) => Number(product.salePrice || product.price) <= Number(query.maxPrice));
  }

  if (query.rating) {
    products = products.filter((product) => (product.averageRating || 0) >= Number(query.rating));
  }

  if (query.sort === "price") {
    products.sort((a, b) => Number(a.salePrice || a.price) - Number(b.salePrice || b.price));
    if (query.order === "desc") products.reverse();
  }

  const start = (page - 1) * limit;
  const paged = products.slice(start, start + limit);

  return {
    data: paged,
    meta: {
      total: products.length,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(products.length / limit)),
    },
  };
}

export async function getCategories() {
  return fetchJson<{ data: Category[] }>(
    "/categories",
    { data: demoCategories },
    { revalidate: 300, tags: ["categories"] },
  );
}

export async function getProducts(query: ProductQuery = {}) {
  const normalizedQuery = { limit: "12", ...query };
  const queryString = toQueryString(normalizedQuery);

  return fetchJson<ProductListResponse>(
    `/products?${queryString}`,
    filterDemoProducts(normalizedQuery),
    { revalidate: 45, tags: ["products"] },
  );
}

export async function getFeaturedProducts(limit = 8) {
  return fetchJson<{ data: Product[] }>(
    `/products/featured?limit=${limit}`,
    {
      data: demoProducts.filter((product) => product.isFeatured).slice(0, limit),
    },
    { revalidate: 300, tags: ["products", "featured-products"] },
  );
}

export async function getProductBySlug(slug: string) {
  const fallback = demoProducts.find((product) => product.slug === slug);
  return fetchJson<{ data: Product | null }>(
    `/products/slug/${slug}`,
    { data: fallback || null },
    { revalidate: 60, tags: ["products", `product:${slug}`] },
  );
}

export async function getCategoryBySlug(slug: string, query: ProductQuery = {}) {
  const category = demoCategories.find((item) => item.slug === slug);
  const products = filterDemoProducts({ ...query, category: slug });
  const queryString = toQueryString({ limit: "12", ...query });

  return fetchJson<CategoryProductResponse>(
    `/categories/slug/${slug}?${queryString}`,
    {
      data: {
        ...(category || demoCategories[0]),
        products: products.data,
      },
      meta: products.meta,
    },
    { revalidate: 60, tags: ["categories", "products", `category:${slug}`] },
  );
}

export function getDemoProducts() {
  return demoProducts;
}
