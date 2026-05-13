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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createProductDto) {
        const slug = createProductDto.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        let category = await this.prisma.category.findFirst();
        if (!category) {
            category = await this.prisma.category.create({
                data: { name: 'Chăn Ga Gối', slug: 'chan-ga-goi' }
            });
        }
        const variantsData = createProductDto.variants?.map((v) => ({
            name: v.name,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            options: v.options
        })) || [];
        const product = await this.prisma.product.create({
            data: {
                name: createProductDto.name,
                slug: slug + '-' + Date.now().toString().slice(-4),
                description: createProductDto.description,
                price: createProductDto.price,
                stock: createProductDto.stock,
                categoryId: category.id,
                sku: 'SKU-' + Date.now().toString().slice(-6),
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
    async findAll() {
        const products = await this.prisma.product.findMany({
            include: {
                category: true,
                variants: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return {
            data: products,
            meta: {
                total: products.length,
                page: 1,
                limit: products.length,
                totalPages: 1
            }
        };
    }
    async findOne(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { category: true, variants: true, images: true }
        });
        return { data: product };
    }
    async update(id, updateProductDto) {
        const variantsData = updateProductDto.variants?.map((v) => ({
            name: v.name,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
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