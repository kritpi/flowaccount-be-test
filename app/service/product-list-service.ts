import type { ProductDomain, ProductListFilter } from "../domain/product.ts";
import { productRepository, type ProductRepository } from "../repository/product-repository.ts";

export const productListService = async (
  filter: ProductListFilter,
  repo: ProductRepository = productRepository,
): Promise<ProductDomain[]> => repo.findAll(filter);
