require("dotenv").config();

const express = require("express");
const cors = require("cors");
const QRCode = require("qrcode");
const { randomBytes, randomUUID } = require("crypto");

const store = require("./store");

const app = express();
const PORT = Number(process.env.PORT || 5000);
const BASE_URL = (process.env.BASE_URL || `http://localhost:${PORT}`).replace(/\/$/, "");
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

function makeShortCode() {
  return randomBytes(6).toString("base64url").slice(0, 8);
}

app.use(
  cors({
    origin: FRONTEND_ORIGIN
  })
);
app.use(express.json());

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/qrs", (_req, res) => {
  res.json({ data: store.listQrs() });
});

app.post("/api/qrs", async (req, res, next) => {
  try {
    const url = typeof req.body?.url === "string" ? req.body.url.trim() : "";

    if (!url || !isValidHttpUrl(url)) {
      return res.status(400).json({
        error: "Please provide a valid URL starting with http:// or https://"
      });
    }

    let shortCode = "";
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = makeShortCode();
      if (!store.hasShortCode(candidate)) {
        shortCode = candidate;
        break;
      }
    }

    if (!shortCode) {
      return res.status(500).json({ error: "Could not generate a unique QR code" });
    }

    const trackedUrl = `${BASE_URL}/r/${shortCode}`;
    const qrImageDataUrl = await QRCode.toDataURL(trackedUrl, {
      width: 240,
      margin: 1
    });

    const record = {
      id: randomUUID(),
      originalUrl: url,
      shortCode,
      trackedUrl,
      qrImageDataUrl,
      scanCount: 0,
      createdAt: new Date().toISOString()
    };

    store.createQr(record);

    return res.status(201).json({ data: record });
  } catch (error) {
    return next(error);
  }
});

app.get("/r/:shortCode", (req, res) => {
  const { shortCode } = req.params;
  const record = store.incrementScanCount(shortCode);

  if (!record) {
    return res.status(404).send("QR code not found");
  }

  return res.redirect(302, record.originalUrl);
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Backend running at ${BASE_URL}`);
});
