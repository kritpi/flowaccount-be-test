import type { Request, Response } from "express";
import { toProductListFilter, toProductResponse } from "../dto/product.ts";
import { productListService } from "../service/product-list-service.ts";

export const productList = async (req: Request, res: Response) => {
  const filter = toProductListFilter(req.query);
  const products = await productListService(filter);

  res.status(200).json(products.map(toProductResponse));
};
