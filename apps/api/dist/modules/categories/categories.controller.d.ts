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
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
    }>;
    findAll(): Promise<{
        data: ({
            parent: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                image: string | null;
                createdAt: Date;
                updatedAt: Date;
                parentId: string | null;
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
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
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
                createdAt: Date;
                updatedAt: Date;
                parentId: string | null;
            } | null;
            children: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                image: string | null;
                createdAt: Date;
                updatedAt: Date;
                parentId: string | null;
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
                categoryId: string;
                isActive: boolean;
                isFeatured: boolean;
                tags: string[];
            }[];
        } & {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            image: string | null;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
        };
    }>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        parentId: string | null;
    }>;
}
