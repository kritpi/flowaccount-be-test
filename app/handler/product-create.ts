import type { Request, Response } from "express";
import { toProductCreate, toProductResponse } from "../dto/product.ts";
import { productCreateService } from "../service/product-create-service.ts";

export const productCreate = async (req: Request, res: Response) => {
  const input = toProductCreate(req.body);
  const product = await productCreateService(input);

  res.status(201).json(toProductResponse(product));
};
