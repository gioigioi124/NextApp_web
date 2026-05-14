import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createCategoryDto: CreateCategoryDto): Promise<{
        name: string;
        description: string | null;
        image: string | null;
        parentId: string | null;
        id: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        data: ({
            parent: {
                name: string;
                description: string | null;
                image: string | null;
                parentId: string | null;
                id: string;
                slug: string;
                createdAt: Date;
                updatedAt: Date;
            } | null;
            _count: {
                products: number;
            };
        } & {
            name: string;
            description: string | null;
            image: string | null;
            parentId: string | null;
            id: string;
            slug: string;
            createdAt: Date;
            updatedAt: Date;
        })[];
    }>;
    findOne(id: string): Promise<{
        data: {
            parent: {
                name: string;
                description: string | null;
                image: string | null;
                parentId: string | null;
                id: string;
                slug: string;
                createdAt: Date;
                updatedAt: Date;
            } | null;
            children: {
                name: string;
                description: string | null;
                image: string | null;
                parentId: string | null;
                id: string;
                slug: string;
                createdAt: Date;
                updatedAt: Date;
            }[];
            products: {
                name: string;
                description: string;
                id: string;
                slug: string;
                createdAt: Date;
                updatedAt: Date;
                price: import("@prisma/client/runtime/library").Decimal;
                salePrice: import("@prisma/client/runtime/library").Decimal | null;
                sku: string;
                stock: number;
                categoryId: string;
                isActive: boolean;
                isFeatured: boolean;
                tags: string[];
            }[];
        } & {
            name: string;
            description: string | null;
            image: string | null;
            parentId: string | null;
            id: string;
            slug: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<{
        name: string;
        description: string | null;
        image: string | null;
        parentId: string | null;
        id: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        name: string;
        description: string | null;
        image: string | null;
        parentId: string | null;
        id: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
