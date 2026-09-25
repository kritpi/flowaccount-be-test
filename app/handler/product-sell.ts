import type { Request, Response } from "express";
import { toProductResponse, toProductSell } from "../dto/product.ts";
import { productSellService } from "../service/product-sell-service.ts";

export const productSell = async (req: Request, res: Response) => {
  const input = toProductSell(req.body);
  const product = await productSellService(input);

  res.status(200).json(toProductResponse(product));
};
