import express from "express";
import router from "./route.ts";
import { errorHandler } from "./middleware/error-handler.ts";

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.use(express.json());
app.use(router);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
