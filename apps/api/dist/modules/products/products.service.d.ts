import { PrismaService } from '../../prisma/prisma.service';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createProductDto: any): Promise<{
        data: {
            images: {
                id: string;
                url: string;
                alt: string | null;
                position: number;
                productId: string;
            }[];
            variants: {
                id: string;
                name: string;
                image: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                sku: string;
                stock: number;
                options: import("@prisma/client/runtime/library").JsonValue;
                productId: string;
            }[];
        } & {
            id: string;
            name: string;
            slug: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            salePrice: import("@prisma/client/runtime/library").Decimal | null;
            sku: string;
            stock: number;
            isActive: boolean;
            isFeatured: boolean;
            tags: string[];
            attributes: import("@prisma/client/runtime/library").JsonValue | null;
            categoryId: string;
        };
        message: string;
    }>;
    findAll(query: {
        page?: number;
        limit?: number;
        search?: string;
        categoryId?: string;
    }): Promise<{
        data: ({
            category: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                image: string | null;
                parentId: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
            images: {
                id: string;
                url: string;
                alt: string | null;
                position: number;
                productId: string;
            }[];
            variants: {
                id: string;
                name: string;
                image: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                sku: string;
                stock: number;
                options: import("@prisma/client/runtime/library").JsonValue;
                productId: string;
            }[];
        } & {
            id: string;
            name: string;
            slug: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            salePrice: import("@prisma/client/runtime/library").Decimal | null;
            sku: string;
            stock: number;
            isActive: boolean;
            isFeatured: boolean;
            tags: string[];
            attributes: import("@prisma/client/runtime/library").JsonValue | null;
            categoryId: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        data: {
            category: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                image: string | null;
                parentId: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
            images: {
                id: string;
                url: string;
                alt: string | null;
                position: number;
                productId: string;
            }[];
            variants: {
                id: string;
                name: string;
                image: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                sku: string;
                stock: number;
                options: import("@prisma/client/runtime/library").JsonValue;
                productId: string;
            }[];
        } & {
            id: string;
            name: string;
            slug: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            salePrice: import("@prisma/client/runtime/library").Decimal | null;
            sku: string;
            stock: number;
            isActive: boolean;
            isFeatured: boolean;
            tags: string[];
            attributes: import("@prisma/client/runtime/library").JsonValue | null;
            categoryId: string;
        };
    }>;
    update(id: string, updateProductDto: any): Promise<{
        data: {
            images: {
                id: string;
                url: string;
                alt: string | null;
                position: number;
                productId: string;
            }[];
            variants: {
                id: string;
                name: string;
                image: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                sku: string;
                stock: number;
                options: import("@prisma/client/runtime/library").JsonValue;
                productId: string;
            }[];
        } & {
            id: string;
            name: string;
            slug: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client/runtime/library").Decimal;
            salePrice: import("@prisma/client/runtime/library").Decimal | null;
            sku: string;
            stock: number;
            isActive: boolean;
            isFeatured: boolean;
            tags: string[];
            attributes: import("@prisma/client/runtime/library").JsonValue | null;
            categoryId: string;
        };
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
