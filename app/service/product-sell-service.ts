import type { ProductDomain, ProductSellDomain } from "../domain/product.ts";
import { NotFoundError, ValidationError } from "../errors.ts";
import { productRepository, type ProductRepository } from "../repository/product-repository.ts";

// quantity > 0 is already enforced by toProductSell before this runs.
export const productSellService = async (
  input: ProductSellDomain,
  repo: ProductRepository = productRepository,
): Promise<ProductDomain> => {
  const product = await repo.findById(input.productId);

  if (!product) {
    throw new NotFoundError(["ไม่พบสินค้า"]);
  }

  if (product.stock < input.quantity) {
    throw new ValidationError([`สินค้าในสต็อกไม่เพียงพอ (คงเหลือ ${product.stock})`]);
  }

  return repo.save({ ...product, stock: product.stock - input.quantity });
};
