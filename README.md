# flowaccount-be-test

A product inventory REST API built with Express 5 and TypeScript. It can create products, list them (optionally by category) and sell stock.

Products live in an in-memory repository, so all data is lost when the server restarts.

## Running

Node.js runs the `.ts` files directly with no build step, so you need a Node version that supports type stripping (22.18+ or 23.6+).

```bash
npm install
```

```bash
npm run dev
```

The server listens on `PORT` (default `8080`; see `.env.example`). All endpoints are under `/api`.


| Script              | What it does                           |
| ------------------- | -------------------------------------- |
| `npm run dev`       | Start with auto-reload on file changes |
| `npm start`         | Start once                             |
| `npm run typecheck` | Type-check with `tsc --noEmit`         |




## Conventions

### Money

`price` is an **integer in satang**, where 1 THB = 100 satang: the last two digits are satang. Decimal numbers are rejected.


| THB    | `price` |
| ------ | ------- |
| 45.00  | `4500`  |
| 123.45 | `12345` |




### Categories

`category` must be one of these four values, exactly as written:

`อาหาร` · `เครื่องดื่ม` · `ของใช้` · `เสื้อผ้า`

### Product object

Every endpoint that returns a product uses this shape:


| Field       | Type    | Description                                |
| ----------- | ------- | ------------------------------------------ |
| `id`        | integer | Assigned by the server, counting up from 1 |
| `name`      | string  | Product name                               |
| `sku`       | string  | Unique product code                        |
| `price`     | integer | Price in satang                            |
| `stock`     | integer | Units in stock                             |
| `category`  | string  | One of the four categories                 |
| `createdAt` | string  | Creation time (ISO 8601, UTC)              |




### Errors

Every error returns a list of Thai messages. When a request breaks several validation rules, all of the messages are included:

```json
{ "errors": ["ชื่อสินค้าต้องไม่ว่าง", "ราคาต้องมากกว่า 0"] }
```


| Status | Meaning                                                                     |
| ------ | --------------------------------------------------------------------------- |
| `400`  | The input is invalid or a business rule failed                              |
| `404`  | The product was not found                                                   |
| `500`  | Unexpected server error. The body is `{ "error": "Internal Server Error" }` |


---



## Endpoints


| Method | Path                                          | Description                           |
| ------ | --------------------------------------------- | ------------------------------------- |
| `GET`  | `[/api/products](#get-apiproducts)`           | List products, optionally by category |
| `POST` | `[/api/products](#post-apiproducts)`          | Create a product                      |
| `POST` | `[/api/products/sell](#post-apiproductssell)` | Sell a product (deduct stock)         |


---



### `GET /api/products`

Lists all products in id order. Pass `category` to get only the products in that category.

**Query parameters**


| Name       | Required | Description                                                           |
| ---------- | -------- | --------------------------------------------------------------------- |
| `category` | No       | One of the four categories. Thai text in the URL must be URL-encoded. |


**Example**

```bash
curl -G localhost:8080/api/products --data-urlencode "category=อาหาร"
```

`200 OK`: an array of product objects. It is `[]` when nothing matches.

```json
[
  {
    "id": 1,
    "name": "ข้าวผัด",
    "sku": "FOOD001",
    "price": 4500,
    "stock": 20,
    "category": "อาหาร",
    "createdAt": "2026-09-25T07:29:54.324Z"
  }
]
```

**Errors**


| Status | When                                                                               | Message                                                         |
| ------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `400`  | `category` is not one of the four categories, is empty, or is given more than once | `หมวดหมู่ต้องเป็นหนึ่งใน: อาหาร, เครื่องดื่ม, ของใช้, เสื้อผ้า` |


---



### `POST /api/products`

Creates a product. The server assigns `id` and `createdAt`.

**Request body** (`Content-Type: application/json`)


| Field      | Type    | Rules                                                                                                       |
| ---------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| `name`     | string  | Required. Must not be empty after trimming spaces.                                                          |
| `sku`      | string  | Required. At least 3 characters after trimming. Must not match any existing product's SKU (case-sensitive). |
| `price`    | integer | Satang, greater than 0                                                                                      |
| `stock`    | integer | 0 or more                                                                                                   |
| `category` | string  | One of the four categories                                                                                  |


Spaces at the start and end of `name` and `sku` are removed before saving.

**Example**

```bash
curl -X POST localhost:8080/api/products \
  -H 'Content-Type: application/json' \
  -d '{"name":"ข้าวผัด","sku":"FOOD001","price":4500,"stock":20,"category":"อาหาร"}'
```

`201 Created`: the new product.

```json
{
  "id": 1,
  "name": "ข้าวผัด",
  "sku": "FOOD001",
  "price": 4500,
  "stock": 20,
  "category": "อาหาร",
  "createdAt": "2026-09-25T07:26:20.461Z"
}
```

**Errors** (all `400`)


| Field      | When                            | Message                                                         |
| ---------- | ------------------------------- | --------------------------------------------------------------- |
| `name`     | Missing or empty                | `ชื่อสินค้าต้องไม่ว่าง`                                         |
| `sku`      | Missing or empty                | `รหัสสินค้าต้องไม่ว่าง`                                         |
| `sku`      | Shorter than 3 characters       | `รหัสสินค้าต้องมีอย่างน้อย 3 ตัวอักษร`                          |
| `sku`      | Already used by another product | `รหัสสินค้านี้มีอยู่แล้ว`                                       |
| `price`    | Missing, not an integer, or ≤ 0 | `ราคาต้องมากกว่า 0`                                             |
| `stock`    | Missing, not an integer, or < 0 | `จำนวนคงเหลือต้องไม่ติดลบ`                                      |
| `category` | Not one of the four categories  | `หมวดหมู่ต้องเป็นหนึ่งใน: อาหาร, เครื่องดื่ม, ของใช้, เสื้อผ้า` |


The duplicate-SKU check runs only after every other field is valid.

---



### `POST /api/products/sell`

Sells `quantity` units of a product and deducts them from its stock.

**Request body** (`Content-Type: application/json`)


| Field       | Type    | Rules          |
| ----------- | ------- | -------------- |
| `productId` | integer | Greater than 0 |
| `quantity`  | integer | Greater than 0 |


**Checks, in order.** The request stops at the first failed step:

1. `quantity` is greater than 0, and `productId` is a positive integer. If not, the response is `400`.
2. The product exists. If not, the response is `404`.
3. `stock >= quantity`. If not, the response is `400`, and the stock is not changed.
4. The stock becomes `stock - quantity`.

**Example**

```bash
curl -X POST localhost:8080/api/products/sell \
  -H 'Content-Type: application/json' \
  -d '{"productId":1,"quantity":2}'
```

`200 OK`: the product with its updated stock.

```json
{
  "id": 1,
  "name": "ข้าวผัด",
  "sku": "FOOD001",
  "price": 4500,
  "stock": 18,
  "category": "อาหาร",
  "createdAt": "2026-09-25T07:26:20.461Z"
}
```

**Errors**


| Status | When                                                       | Message                                   |
| ------ | ---------------------------------------------------------- | ----------------------------------------- |
| `400`  | `quantity` is missing, not an integer, or ≤ 0              | `จำนวนที่ขายต้องมากกว่า 0`                |
| `400`  | `productId` is missing, not an integer, or ≤ 0             | `productId ต้องเป็นจำนวนเต็มที่มากกว่า 0` |
| `404`  | No product has this `productId`                            | `ไม่พบสินค้า`                             |
| `400`  | `stock` is less than `quantity` (N is the remaining stock) | `สินค้าในสต็อกไม่เพียงพอ (คงเหลือ N)`     |


Selling exactly the remaining stock is allowed and leaves `stock` at `0`.

---



## Known limitations

- **In-memory storage:** products and the id counter reset when the server restarts.
- **Malformed JSON:** a body that isn't valid JSON returns `500` instead of `400`.
- **Unknown routes:** these return Express's default HTML 404 page, not a JSON error.



## Project structure

```
app/
├── index.ts               # Express app setup
├── route.ts               # Route table
├── handler/               # HTTP layer: parse request → call service → send response
├── dto/                   # Request validation and response mapping
├── service/               # Business rules (SKU uniqueness, stock checks)
├── repository/            # In-memory product store
├── domain/                # Product types and categories
├── middleware/            # Error handler ({ errors: [...] } responses)
└── errors.ts              # HttpError, ValidationError (400), NotFoundError (404)
```

