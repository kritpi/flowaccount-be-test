import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors.ts";

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ errors: err.errors });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
};
