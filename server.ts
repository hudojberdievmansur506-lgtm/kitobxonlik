import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Backend CORS Proxy for Books API with a fast 3.5-second timeout to prevent hanging responses
  app.get("/api/books-proxy", async (req, res) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const targetUrl = "https://king-dork-opulently.ngrok-free.dev/api/books";
      const response = await fetch(targetUrl, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json"
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Backend ngrok API response error: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("CORS Proxy error fetching from ngrok:", err);
      const isTimeout = err.name === "AbortError";
      res.status(500).json({ 
        error: isTimeout ? "API so‘rovi vaqti tugadi (Timeout)" : "Backend API bilan ulanib bo‘lmadi", 
        details: isTimeout ? "Masofaviy server 3.5 soniya ichida javob bermadi" : (err.message || String(err)) 
      });
    }
  });

  // Vite development middleware vs Static Production server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
