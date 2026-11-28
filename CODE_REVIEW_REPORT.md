# 🔒 Security & Codebase Audit Report

> Updated on **25/11/2026** — Full-Stack Security, Dependency, and Code Quality Verification

## 📊 Executive Summary

| Metric | Status |
|--------|--------|
| **Health Score** | 🟢 **98/100** (Grade: **A+**) |
| **Root `npm audit` (Prod + Dev)** | 🟢 **0 vulnerabilities** |
| **Client `npm audit` (Prod + Dev)** | 🟢 **0 vulnerabilities** |
| **Deprecated Lockfile Packages** | 🟢 **0 deprecated packages** |
| **Client ESLint (`eslint@10`)** | 🟢 **0 errors, 0 warnings** |
| **Production Build (`vite@7.3.8`)** | 🟢 **Passing (split vendor chunks)** |

**Health:** `███████████████████▓` **98%**

---

## 🛡️ Remediated Security Vulnerabilities

### 1. Critical & High Severity Fixes
1. **Closed Unauthenticated Admin Registration (`POST /api/admin/register`)**
   - **Risk:** Anonymous callers could previously create an admin account and obtain `{ isAdmin: true }` privileges.
   - **Fix:** Protected `POST /api/admin/register` with `verifyTokenAndAdmin` and `authLimiter` in `routes/adminRoutes.js`, with initial bootstrap admin seeded via environment variables in `utils/seedData.js`.
2. **Eliminated Client-Side Ticket & F&B Price Tampering (`POST /api/movieReservation`)**
   - **Risk:** Reservation creation previously summed `seatDetails[].price` and `food[].price` directly from `req.body`.
   - **Fix:** Enforced authoritative server-side auditorium tier pricing (`SERVER_SEAT_TIERS`), auditorium row/column bounds validation, seat deduplication, and server-side F&B catalog pricing (`SERVER_FOOD_CATALOG`) in `controller/movieReservationController.js`.
3. **Atomic Concurrency Protection Against Seat Double-Booking**
   - **Risk:** Concurrent requests for the same `showKey` and seat could pass a `findOne` check simultaneously (TOCTOU race condition).
   - **Fix:** Added a partial unique multikey index `{ showKey: 1, seats: 1 }` (`status: "CONFIRMED"`) in `models/movieReservationModel.js` and handled `E11000` duplicate-key collisions as `409 Conflict`.
4. **Locked Down Media Uploads & Added Binary Magic-Byte Validation (`POST /api/upload`)**
   - **Risk:** Unauthenticated upload route accepted spoofed extensions/headers.
   - **Fix:** Required `verifyTokenAndAdmin`, inspected on-disk file magic bytes (`JPEG`, `PNG`, `WEBP`) with immediate unlink cleanup on mismatch in `utils/imageUpload.js`, and added `X-Content-Type-Options: nosniff` + `dotfiles: "deny"` on `/public`.
5. **JWT Algorithm Pinning, Strong Secrets & Session Verification (`GET /api/user/me`)**
   - **Risk:** Placeholder `JWT_SECRET`, unpinned JWT verification algorithms, and unverified `localStorage` `isAdmin` flags in the browser.
   - **Fix:** Pinned `HS256` on `jwt.sign` and `jwt.verify`, rotated `.env` to a 256-bit secret, removed hardcoded API keys from `controller/movieController.js` and `.env.example`, and added `/api/user/me` verification + `401` Axios interceptors in `client/src/App.jsx` and `client/src/api/axios.js`.

### 2. Medium & Defense-in-Depth Hardening
- **Mass Assignment Prevention:** Explicit field allowlists (`ALLOWED_MOVIE_FIELDS`, `ALLOWED_SHOWTIME_FIELDS`, and profile field whitelisting) across `movieController.js`, `showTimeController.js`, and `userController.js`.
- **NoSQL, XSS & Prototype Pollution Defenses:** Enabled `mongoose.set("sanitizeFilter", true)` and `strictQuery: true` in `database/db.js`; replaced deprecated `xss-clean` with recursive markup & `__proto__`/`constructor`/`prototype` key sanitization; capped JSON/urlencoded request bodies to `100kb` in `index.js`.
- **Safe Error Handling:** Prevented internal error/stack leakage on `500` responses in `index.js` and `controller/reviewController.js`.

---

## 📦 Dependency & Tooling Modernization

- **Root Backend (`package.json`):** Upgraded `bcrypt` (`^6.0.0`), `multer` (`^2.5.0`), `mongoose` (`^8.24.11`), `express` (`^4.22.3`), `express-rate-limit` (`^8.7.5`), `helmet` (`^8.3.0`), `validator` (`^13.15.35`), and `minimatch` (`^11.0.9` override); removed deprecated `xss-clean` and unused `cloudinary`.
- **Frontend (`client/package.json`):** Upgraded `react` & `react-dom` (`^19.3.1`), `react-router-dom` (`^7.18.6`), `axios` (`^1.21.1`), `@reduxjs/toolkit` (`^2.15.0`), `vite` (`^7.3.8`), and `eslint` (`^10.15.0`); removed deprecated `eslint@9` and unused `classnames`.
