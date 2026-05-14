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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const slugify_1 = __importDefault(require("slugify"));
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCategoryDto) {
        const slug = (0, slugify_1.default)(createCategoryDto.name, { lower: true });
        const existing = await this.prisma.category.findUnique({ where: { slug } });
        if (existing) {
            throw new common_1.ConflictException('Danh mục này đã tồn tại');
        }
        return this.prisma.category.create({
            data: {
                ...createCategoryDto,
                slug,
            },
        });
    }
    async findAll() {
        const categories = await this.prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true }
                },
                parent: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return { data: categories };
    }
    async findOne(id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                children: true,
                parent: true,
                products: true
            }
        });
        if (!category) {
            throw new common_1.NotFoundException('Không tìm thấy danh mục');
        }
        return { data: category };
    }
    async update(id, updateCategoryDto) {
        const response = await this.findOne(id);
        const category = response.data;
        let slug = category.slug;
        if (updateCategoryDto.name) {
            slug = (0, slugify_1.default)(updateCategoryDto.name, { lower: true });
        }
        return this.prisma.category.update({
            where: { id },
            data: {
                ...updateCategoryDto,
                slug,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.category.delete({ where: { id } });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map