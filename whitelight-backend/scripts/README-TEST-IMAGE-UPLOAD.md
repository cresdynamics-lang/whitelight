# Testing image upload via admin panel

## 1. Automated test (API)

From `whitelight-backend`:

```bash
# Backend and MySQL must be running; .env has DB_* and DO_SPACES_*
node scripts/test-image-upload.js
```

Test against **production** API (no local DB needed):

```bash
API_BASE_URL=https://api.whitelightstore.co.ke/api node scripts/test-image-upload.js
```

The script will:
- Log in as admin (default `admin` / `admin123`, or set `ADMIN_USERNAME` / `ADMIN_PASSWORD`)
- Create a product with one test image (small PNG)
- Fetch the product and assert it has an image URL
- Print product id and image URL on success

---

## 2. Manual test (browser)

1. **Start backend and frontend**
   - Backend: `cd whitelight-backend && npm run dev`
   - Frontend: `cd whitelight && npm run dev`

2. **Open admin**
   - Go to `http://localhost:8080/admin` (or your frontend URL)
   - Log in (e.g. admin / admin123)

3. **Create product with image**
   - Go to **Products** → **Add product**
   - Fill: Name, Brand, Category, Price, Description
   - Add at least one size variant
   - Under **Images**, click to choose file and select a JPG/PNG (e.g. from your machine)
   - Click **Save**

4. **Check**
   - Product list shows the new product
   - Open the product: image should load (URL from DigitalOcean Spaces or your DO_SPACES_* config)
   - If you see a broken image or no image, check backend logs for upload errors and that `DO_SPACES_*` in `.env` is correct

---

## 3. If upload fails

- **Backend logs**: Look for `📸 Image uploaded:` or `Upload error:` from `spacesService`.
- **Env**: Ensure `DO_SPACES_ENDPOINT`, `DO_SPACES_KEY`, `DO_SPACES_SECRET`, `DO_SPACES_BUCKET` are set in `whitelight-backend/.env`.
- **Spaces**: Bucket exists, key has write access, and (if using custom domain) CORS allows your frontend origin.
