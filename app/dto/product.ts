import {
  PRODUCT_CATEGORIES,
  type ProductCategory,
  type ProductDomain,
  type ProductCreateDomain,
  type ProductListFilter,
  type ProductSellDomain,
} from "../domain/product.ts";
import { ValidationError } from "../errors.ts";

export type ProductCreateDto = {
  name: string;
  sku: string;
  price: number; // satang, e.g. 12345 = 123.45 THB
  stock: number;
  category: ProductCategory;
};

export type ProductResponseDto = {
  id: number;
  name: string;
  sku: string;
  price: number; // satang
  stock: number;
  category: ProductCategory;
  createdAt: string;
};

export type ProductSellDto = {
  productId: number;
  quantity: number;
};

const SKU_MIN_LENGTH = 3;
const INVALID_CATEGORY_MESSAGE = `หมวดหมู่ต้องเป็นหนึ่งใน: ${PRODUCT_CATEGORIES.join(", ")}`;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "";

const isNonNegativeInteger = (value: unknown): value is number =>
  Number.isSafeInteger(value) && (value as number) >= 0;

const isPositiveInteger = (value: unknown): value is number =>
  Number.isSafeInteger(value) && (value as number) > 0;

const isProductCategory = (value: unknown): value is ProductCategory =>
  PRODUCT_CATEGORIES.includes(value as ProductCategory);

export const toProductCreate = (body: unknown): ProductCreateDomain => {
  const { name, sku, price, stock, category } = (body ?? {}) as Partial<ProductCreateDto>;
  const errors: string[] = [];

  if (!isNonEmptyString(name)) {
    errors.push("ชื่อสินค้าต้องไม่ว่าง");
  }

  if (!isNonEmptyString(sku)) {
    errors.push("รหัสสินค้าต้องไม่ว่าง");
  } else if (sku.trim().length < SKU_MIN_LENGTH) {
    errors.push(`รหัสสินค้าต้องมีอย่างน้อย ${SKU_MIN_LENGTH} ตัวอักษร`);
  }

  if (!isPositiveInteger(price)) {
    errors.push("ราคาต้องมากกว่า 0");
  }

  if (!isNonNegativeInteger(stock)) {
    errors.push("จำนวนคงเหลือต้องไม่ติดลบ");
  }

  if (!isProductCategory(category)) {
    errors.push(INVALID_CATEGORY_MESSAGE);
  }

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }

  return {
    name: (name as string).trim(),
    sku: (sku as string).trim(),
    price: price as number,
    stock: stock as number,
    category: category as ProductCategory,
  };
};

export const toProductListFilter = (query: unknown): ProductListFilter => {
  const { category } = (query ?? {}) as { category?: unknown };

  if (category === undefined) {
    return {};
  }

  if (!isProductCategory(category)) {
    throw new ValidationError([INVALID_CATEGORY_MESSAGE]);
  }

  return { category };
};

// Order matters: quantity is checked before the product lookup in the service.
export const toProductSell = (body: unknown): ProductSellDomain => {
  const { productId, quantity } = (body ?? {}) as Partial<ProductSellDto>;
  const errors: string[] = [];

  if (!isPositiveInteger(quantity)) {
    errors.push("จำนวนที่ขายต้องมากกว่า 0");
  }

  if (!isPositiveInteger(productId)) {
    errors.push("productId ต้องเป็นจำนวนเต็มที่มากกว่า 0");
  }

  if (errors.length > 0) {
    throw new ValidationError(errors);
  }

  return { productId: productId as number, quantity: quantity as number };
};

export const toProductResponse =(product: ProductDomain): ProductResponseDto => ({
  id: product.id,
  name: product.name,
  sku: product.sku,
  price: product.price,
  stock: product.stock,
  category: product.category,
  createdAt: product.createdAt.toISOString(),
});
