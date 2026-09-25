import type { ProductDomain, ProductCreateDomain } from "../domain/product.ts";
import { ValidationError } from "../errors.ts";
import { productRepository, type ProductRepository } from "../repository/product-repository.ts";

export const productCreateService = async (
  input: ProductCreateDomain,
  repo: ProductRepository = productRepository,
): Promise<ProductDomain> => {
  if (await repo.findBySku(input.sku)) {
    throw new ValidationError(["รหัสสินค้านี้มีอยู่แล้ว"]);
  }

  const product: ProductDomain = {
    id: repo.nextId(),
    ...input,
    createdAt: new Date(),
  };

  return repo.save(product);
};
