import type { ProductDomain, ProductListFilter } from "../domain/product.ts";

// In-memory mock. Swap for a real database implementation.
export const createInMemoryProductRepository = () => {
  const products = new Map<number, ProductDomain>();
  let lastId = 0;

  return {
    nextId: (): number => ++lastId,

    save: async (product: ProductDomain): Promise<ProductDomain> => {
      products.set(product.id, product);
      return product;
    },

    findBySku: async (sku: string): Promise<ProductDomain | undefined> => {
      for (const product of products.values()) {
        if (product.sku === sku) return product;
      }
      return undefined;
    },

    findById: async (id: number): Promise<ProductDomain | undefined> => products.get(id),

    findAll: async (filter: ProductListFilter = {}): Promise<ProductDomain[]> => {
      const all = [...products.values()];
      return filter.category ? all.filter((product) => product.category === filter.category) : all;
    },
  };
};

export type ProductRepository = ReturnType<typeof createInMemoryProductRepository>;

export const productRepository = createInMemoryProductRepository();
