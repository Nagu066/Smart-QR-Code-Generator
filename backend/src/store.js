const fs = require("fs");
const path = require("path");

const STORE_FILE = path.join(__dirname, "..", "data", "qrs.json");

function ensureStoreFile() {
  fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });

  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, "[]", "utf8");
  }
}

function readAll() {
  ensureStoreFile();

  try {
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      throw new Error("Store data is not an array");
    }

    return parsed;
  } catch (error) {
    fs.writeFileSync(STORE_FILE, "[]", "utf8");
    return [];
  }
}

function writeAll(records) {
  ensureStoreFile();
  fs.writeFileSync(STORE_FILE, JSON.stringify(records, null, 2), "utf8");
}

function listQrs() {
  return readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function hasShortCode(shortCode) {
  return readAll().some((record) => record.shortCode === shortCode);
}

function createQr(record) {
  const records = readAll();
  records.push(record);
  writeAll(records);
  return record;
}

function incrementScanCount(shortCode) {
  const records = readAll();
  const index = records.findIndex((record) => record.shortCode === shortCode);

  if (index < 0) {
    return null;
  }

  const current = records[index];
  const updated = {
    ...current,
    scanCount: Number(current.scanCount || 0) + 1,
    updatedAt: new Date().toISOString()
  };

  records[index] = updated;
  writeAll(records);

  return updated;
}

module.exports = {
  listQrs,
  hasShortCode,
  createQr,
  incrementScanCount
};

