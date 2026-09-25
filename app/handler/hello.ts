import type { Request, Response } from "express";

export const hello = (_req: Request, res: Response) => {
  res.status(200).send("hello world");
};
