import { useEffect, useState } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5001").replace(
  /\/$/,
  ""
);

function formatDate(isoString) {
  try {
    return new Date(isoString).toLocaleString();
  } catch {
    return isoString;
  }
}

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function App() {
  const [urlInput, setUrlInput] = useState("");
  const [items, setItems] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [createMessage, setCreateMessage] = useState("");

  const hasItems = items.length > 0;
  const backendLabel = API_BASE_URL;

  async function loadQrs() {
    setErrorMessage("");
    setIsLoadingList(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/qrs`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to fetch QR codes");
      }

      setItems(Array.isArray(payload.data) ? payload.data : []);
    } catch (error) {
      setErrorMessage(error.message || "Failed to fetch QR codes");
    } finally {
      setIsLoadingList(false);
    }
  }

  useEffect(() => {
    loadQrs();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setCreateMessage("");
    setErrorMessage("");

    const trimmed = urlInput.trim();
    if (!isValidHttpUrl(trimmed)) {
      setErrorMessage("Enter a valid URL starting with http:// or https://");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/qrs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: trimmed })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to create QR code");
      }

      setUrlInput("");
      setCreateMessage("QR code created successfully.");
      await loadQrs();
    } catch (error) {
      setErrorMessage(error.message || "Failed to create QR code");
    } finally {
      setIsCreating(false);
    }
  }

  async function copyText(value) {
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }

      await navigator.clipboard.writeText(value);
      setCreateMessage("Tracked URL copied.");
    } catch {
      setErrorMessage("Could not copy to clipboard");
    }
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Smart QR Generator MVP</p>
        <h1>Create QR Codes and Track Scans</h1>
        <p className="subtitle">
          Enter a URL, generate a QR code, and track the total scan count using the backend redirect
          endpoint.
        </p>
      </section>

      <section className="panel">
        <form className="qr-form" onSubmit={handleSubmit}>
          <label htmlFor="qr-url">URL</label>
          <div className="form-row">
            <input
              id="qr-url"
              type="url"
              placeholder="https://example.com"
              value={urlInput}
              onChange={(event) => setUrlInput(event.target.value)}
              autoComplete="off"
              required
            />
            <button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create QR"}
            </button>
          </div>
        </form>

        <div className="panel-footer">
          <span className="backend-note">Backend: {backendLabel}</span>
          <button type="button" className="secondary-btn" onClick={loadQrs} disabled={isLoadingList}>
            {isLoadingList ? "Refreshing..." : "Refresh List"}
          </button>
        </div>

        {errorMessage ? <p className="status error">{errorMessage}</p> : null}
        {createMessage ? <p className="status success">{createMessage}</p> : null}
      </section>

      <section className="panel">
        <div className="section-header">
          <h2>Created QR Codes</h2>
          <span className="count-badge">{items.length}</span>
        </div>

        {isLoadingList ? <p className="empty">Loading QR codes...</p> : null}
        {!isLoadingList && !hasItems ? (
          <p className="empty">No QR codes yet. Create one above.</p>
        ) : null}

        {!isLoadingList && hasItems ? (
          <div className="qr-grid">
            {items.map((item) => (
              <article className="qr-card" key={item.id}>
                <img className="qr-image" src={item.qrImageDataUrl} alt={`QR for ${item.originalUrl}`} />

                <div className="qr-content">
                  <p className="label">Original URL</p>
                  <a href={item.originalUrl} target="_blank" rel="noreferrer" className="url-link">
                    {item.originalUrl}
                  </a>

                  <p className="label">Tracked URL (encoded in QR)</p>
                  <div className="tracked-row">
                    <a href={item.trackedUrl} target="_blank" rel="noreferrer" className="url-link">
                      {item.trackedUrl}
                    </a>
                    <button type="button" className="small-btn" onClick={() => copyText(item.trackedUrl)}>
                      Copy
                    </button>
                  </div>

                  <div className="meta-row">
                    <span>
                      Scans: <strong>{item.scanCount}</strong>
                    </span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
