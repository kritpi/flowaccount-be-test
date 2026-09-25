import type { Product } from "../domain/product.ts";

// In-memory store. Swap for a real database implementation.
const products = new Map<string, Product>();

export const productRepository = {
  save: async (product: Product): Promise<Product> => {
    products.set(product.id, product);
    return product;
  },
};
