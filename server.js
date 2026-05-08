/* global process */
import http from "http";
import fs from "fs";
import path from "path";

const port = process.env.PORT || 8080;
const distPath = path.join(process.cwd(), "dist");

const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  const requestPath = new URL(req.url, `http://${req.headers.host}`).pathname;
  const filePath = path.join(distPath, requestPath === "/" ? "index.html" : requestPath);

  fs.readFile(filePath, (error, content) => {
    if (error) {
      fs.readFile(path.join(distPath, "index.html"), (indexError, indexContent) => {
        if (indexError) {
          res.writeHead(500);
          res.end("Error loading CloudPortfolio.");
          return;
        }

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(indexContent);
      });
      return;
    }

    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
    res.end(content);
  });
});

server.listen(port, () => {
  console.log(`CloudPortfolio server running on port ${port}`);
});
