"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const slugify_1 = __importDefault(require("slugify"));
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createProductDto) {
        const slug = (0, slugify_1.default)(createProductDto.name, { lower: true }) + '-' + Date.now().toString().slice(-4);
        if (createProductDto.categoryId) {
            const category = await this.prisma.category.findUnique({ where: { id: createProductDto.categoryId } });
            if (!category)
                throw new common_1.NotFoundException('Danh mục không tồn tại');
        }
        const variantsData = createProductDto.variants?.map((v) => ({
            name: v.name,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            image: v.image,
            options: v.options
        })) || [];
        const product = await this.prisma.product.create({
            data: {
                name: createProductDto.name,
                slug: slug,
                description: createProductDto.description,
                price: createProductDto.price,
                stock: createProductDto.stock,
                categoryId: createProductDto.categoryId,
                sku: createProductDto.sku || 'SKU-' + Date.now().toString().slice(-6),
                isActive: createProductDto.status === 'active',
                variants: {
                    create: variantsData
                }
            },
            include: {
                variants: true
            }
        });
        return {
            data: product,
            message: "Product created successfully"
        };
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = query.search || '';
        const categoryId = query.categoryId;
        const where = {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ],
        };
        if (categoryId) {
            where.categoryId = categoryId;
        }
        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                include: {
                    category: true,
                    variants: true,
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit,
            }),
            this.prisma.product.count({ where }),
        ]);
        return {
            data: products,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async findOne(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { category: true, variants: true, images: true }
        });
        if (!product)
            throw new common_1.NotFoundException('Không tìm thấy sản phẩm');
        return { data: product };
    }
    async update(id, updateProductDto) {
        await this.findOne(id);
        const variantsData = updateProductDto.variants?.map((v) => ({
            name: v.name,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            image: v.image,
            options: v.options
        })) || [];
        const product = await this.prisma.product.update({
            where: { id },
            data: {
                name: updateProductDto.name,
                description: updateProductDto.description,
                price: updateProductDto.price,
                stock: updateProductDto.stock,
                categoryId: updateProductDto.categoryId,
                sku: updateProductDto.sku,
                isActive: updateProductDto.status === 'active',
                variants: {
                    deleteMany: {},
                    create: variantsData
                }
            },
            include: {
                variants: true
            }
        });
        return { data: product, message: "Cập nhật thành công" };
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.product.delete({
            where: { id }
        });
        return { message: "Đã xóa sản phẩm" };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map