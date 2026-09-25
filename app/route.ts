import { Router } from "express";
import { hello, productCreate, productList, productSell } from "./handler/index.ts";

const router = Router();
const api = Router();

router.use("/api", api);

api.get("/", hello);
api.get("/products", productList);
api.post("/products", productCreate);
api.post("/products/sell", productSell);

export default router;
