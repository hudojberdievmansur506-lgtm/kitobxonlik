import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  const BACKEND_URL = "http://172.23.0.118:3001/api";

  // Setup JSON body parsing middleware
  app.use(express.json());

  // Backend CORS Proxy for Books API with a fast 3.5-second timeout to prevent hanging responses
  app.get("/api/books-proxy", async (req, res) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const targetUrl = `${BACKEND_URL}/books`;
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

  // Backend CORS Proxy for adding books (POST)
  app.post("/api/books-proxy", async (req, res) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const targetUrl = `${BACKEND_URL}/books`;
      const response = await fetch(targetUrl, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Backend ngrok API response error: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("CORS Proxy error posting to ngrok:", err);
      const isTimeout = err.name === "AbortError";
      res.status(500).json({ 
        error: isTimeout ? "API so‘rovi vaqti tugadi (Timeout)" : "Kitob qo‘shishda xatolik yuz berdi", 
        details: isTimeout ? "Masofaviy server 3.5 soniya ichida javob bermadi" : (err.message || String(err)) 
      });
    }
  });

  // Backend CORS Proxy for deleting books (DELETE)
  app.delete("/api/books-proxy/:id", async (req, res) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const { id } = req.params;
      const targetUrl = `${BACKEND_URL}/books/${id}`;
      const response = await fetch(targetUrl, {
        method: "DELETE",
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

      const contentType = response.headers.get("content-type");
      let data = { success: true };
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            data = { result: text } as any;
          }
        }
      }
      res.json(data);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("CORS Proxy error deleting from ngrok:", err);
      const isTimeout = err.name === "AbortError";
      res.status(500).json({ 
        error: isTimeout ? "API so‘rovi vaqti tugadi (Timeout)" : "Kitobni o‘chirishda xatolik yuz berdi", 
        details: isTimeout ? "Masofaviy server 3.5 soniya ichida javob bermadi" : (err.message || String(err)) 
      });
    }
  });

  // Backend CORS Proxy for Questions (GET)
  app.get("/api/questions-proxy", async (req, res) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const targetUrl = `${BACKEND_URL}/questions`;
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
      console.error("CORS Proxy error fetching questions:", err);
      const isTimeout = err.name === "AbortError";
      res.status(500).json({ 
        error: isTimeout ? "API so‘rovi vaqti tugadi (Timeout)" : "Savollarni ko‘chirib bo‘lmadi", 
        details: isTimeout ? "Masofaviy server 3.5 soniya ichida javob bermadi" : (err.message || String(err)) 
      });
    }
  });

  // Backend CORS Proxy for specific book questions (GET)
  app.get("/api/books-proxy/:bookId/questions", async (req, res) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const { bookId } = req.params;
      const targetUrl = `${BACKEND_URL}/books/${bookId}/questions`;
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
      console.error(`CORS Proxy error fetching questions for book ${req.params.bookId}:`, err);
      const isTimeout = err.name === "AbortError";
      res.status(500).json({ 
        error: isTimeout ? "API so‘rovi vaqti tugadi (Timeout)" : "Kitob savollarini ko‘chirib bo‘lmadi", 
        details: isTimeout ? "Masofaviy server 3.5 soniya ichida javob bermadi" : (err.message || String(err)) 
      });
    }
  });

  // Backend CORS Proxy for adding questions (POST)
  app.post("/api/questions-proxy", async (req, res) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const targetUrl = `${BACKEND_URL}/questions`;
      const response = await fetch(targetUrl, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Backend ngrok API response error: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("CORS Proxy error posting question:", err);
      const isTimeout = err.name === "AbortError";
      res.status(500).json({ 
        error: isTimeout ? "API so‘rovi vaqti tugadi (Timeout)" : "Savol qo‘shishda xatolik yuz berdi", 
        details: isTimeout ? "Masofaviy server 3.5 soniya ichida javob bermadi" : (err.message || String(err)) 
      });
    }
  });

  // Backend CORS Proxy for Results (GET)
  app.get("/api/results-proxy", async (req, res) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const targetUrl = `${BACKEND_URL}/results`;
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
      console.error("CORS Proxy error fetching results:", err);
      const isTimeout = err.name === "AbortError";
      res.status(500).json({ 
        error: isTimeout ? "API so‘rovi vaqti tugadi (Timeout)" : "Natijalarni ko‘chirib bo‘lmadi", 
        details: isTimeout ? "Masofaviy server 3.5 soniya ichida javob bermadi" : (err.message || String(err)) 
      });
    }
  });

  // Backend CORS Proxy for sending results (POST)
  app.post("/api/results-proxy", async (req, res) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const targetUrl = `${BACKEND_URL}/results`;
      const response = await fetch(targetUrl, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Backend ngrok API response error: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("CORS Proxy error posting result:", err);
      const isTimeout = err.name === "AbortError";
      res.status(500).json({ 
        error: isTimeout ? "API so‘rovi vaqti tugadi (Timeout)" : "Natijani saqlashda xatolik yuz berdi", 
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
