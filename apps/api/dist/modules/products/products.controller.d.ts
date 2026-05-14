import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): Promise<{
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
    findAll(page?: number, limit?: number, search?: string, categoryId?: string): Promise<{
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
    update(id: string, updateProductDto: UpdateProductDto): Promise<{
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
