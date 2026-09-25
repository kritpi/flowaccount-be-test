import type { ProductDomain, ProductCreateDomain } from "../domain/product.ts";
import { ValidationError } from "../errors.ts";

export type ProductCreateDto = {
  name: string;
};

export type ProductResponseDto = {
  id: string;
  name: string;
  createdAt: string;
};

export const toProductCreate = (body: unknown): ProductCreateDomain => {
  const { name } = (body ?? {}) as Partial<ProductCreateDto>;

  if (typeof name !== "string" || name.trim() === "") {
    throw new ValidationError("name is required");
  }

  return { name: name.trim() };
};

export const toProductResponse = (product: ProductDomain): ProductResponseDto => ({
  id: product.id,
  name: product.name,
  createdAt: product.createdAt.toISOString(),
});
