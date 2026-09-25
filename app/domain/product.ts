export const PRODUCT_CATEGORIES = ["อาหาร", "เครื่องดื่ม", "ของใช้", "เสื้อผ้า"] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type ProductDomain = {
  id: number;
  name: string;
  sku: string;
  // THB in satang (integer); last 2 digits are satang. e.g. 10000 = 100.00 THB, 12345 = 123.45 THB
  price: number;
  stock: number;
  category: ProductCategory;
  createdAt: Date;
};

export type ProductCreateDomain = Omit<ProductDomain, "id" | "createdAt">;

export type ProductListFilter = {
  category?: ProductCategory;
};

export type ProductSellDomain = {
  productId: number;
  quantity: number;
};
