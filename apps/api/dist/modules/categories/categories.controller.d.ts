import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createCategoryDto: CreateCategoryDto): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        image: string | null;
        parentId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        data: ({
            parent: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                image: string | null;
                parentId: string | null;
                createdAt: Date;
                updatedAt: Date;
            } | null;
            _count: {
                products: number;
            };
        } & {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            image: string | null;
            parentId: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
    }>;
    findOne(id: string): Promise<{
        data: {
            parent: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                image: string | null;
                parentId: string | null;
                createdAt: Date;
                updatedAt: Date;
            } | null;
            children: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                image: string | null;
                parentId: string | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
            products: {
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
            }[];
        } & {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            image: string | null;
            parentId: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        image: string | null;
        parentId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        image: string | null;
        parentId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
