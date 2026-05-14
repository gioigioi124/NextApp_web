import { PrismaService } from '../../prisma/prisma.service';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createProductDto: any): Promise<{
        data: {
            variants: {
                id: string;
                name: string;
                price: import("@prisma/client/runtime/library").Decimal;
                sku: string;
                stock: number;
                image: string | null;
                options: import("@prisma/client/runtime/library").JsonValue;
                productId: string;
            }[];
        } & {
            id: string;
            name: string;
            slug: string;
            description: string;
            price: import("@prisma/client/runtime/library").Decimal;
            salePrice: import("@prisma/client/runtime/library").Decimal | null;
            sku: string;
            stock: number;
            isActive: boolean;
            isFeatured: boolean;
            tags: string[];
            createdAt: Date;
            updatedAt: Date;
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
                createdAt: Date;
                updatedAt: Date;
                image: string | null;
                parentId: string | null;
            };
            variants: {
                id: string;
                name: string;
                price: import("@prisma/client/runtime/library").Decimal;
                sku: string;
                stock: number;
                image: string | null;
                options: import("@prisma/client/runtime/library").JsonValue;
                productId: string;
            }[];
        } & {
            id: string;
            name: string;
            slug: string;
            description: string;
            price: import("@prisma/client/runtime/library").Decimal;
            salePrice: import("@prisma/client/runtime/library").Decimal | null;
            sku: string;
            stock: number;
            isActive: boolean;
            isFeatured: boolean;
            tags: string[];
            createdAt: Date;
            updatedAt: Date;
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
            images: {
                id: string;
                productId: string;
                url: string;
                alt: string | null;
                position: number;
            }[];
            category: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                image: string | null;
                parentId: string | null;
            };
            variants: {
                id: string;
                name: string;
                price: import("@prisma/client/runtime/library").Decimal;
                sku: string;
                stock: number;
                image: string | null;
                options: import("@prisma/client/runtime/library").JsonValue;
                productId: string;
            }[];
        } & {
            id: string;
            name: string;
            slug: string;
            description: string;
            price: import("@prisma/client/runtime/library").Decimal;
            salePrice: import("@prisma/client/runtime/library").Decimal | null;
            sku: string;
            stock: number;
            isActive: boolean;
            isFeatured: boolean;
            tags: string[];
            createdAt: Date;
            updatedAt: Date;
            categoryId: string;
        };
    }>;
    update(id: string, updateProductDto: any): Promise<{
        data: {
            variants: {
                id: string;
                name: string;
                price: import("@prisma/client/runtime/library").Decimal;
                sku: string;
                stock: number;
                image: string | null;
                options: import("@prisma/client/runtime/library").JsonValue;
                productId: string;
            }[];
        } & {
            id: string;
            name: string;
            slug: string;
            description: string;
            price: import("@prisma/client/runtime/library").Decimal;
            salePrice: import("@prisma/client/runtime/library").Decimal | null;
            sku: string;
            stock: number;
            isActive: boolean;
            isFeatured: boolean;
            tags: string[];
            createdAt: Date;
            updatedAt: Date;
            categoryId: string;
        };
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
