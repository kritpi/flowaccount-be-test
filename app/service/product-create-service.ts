import { randomUUID } from "node:crypto";
import type { ProductDomain, ProductCreateDomain } from "../domain/product.ts";
import { productRepository } from "../repository/product-repository.ts";

export const productCreateService = async (input: ProductCreateDomain): Promise<ProductDomain> => {
  const product: ProductDomain = {
    id: randomUUID(),
    name: input.name,
    createdAt: new Date(),
  };

  return productRepository.save(product);
};
