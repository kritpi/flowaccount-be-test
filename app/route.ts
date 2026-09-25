import { Router } from "express";
import { hello, productCreate } from "./handler/index.ts";

const router = Router();
const api = Router();

router.use("/api", api);

api.get("/", hello);
api.post("/products", productCreate);

export default router;
