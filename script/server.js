import http from "http";
import fs from "fs/promises";

const server = http.createServer(async (request, response) => {
  response.setHeader("Content-Type", "text/html");

  // POST /article
  // GET /article

  if (request.method === "GET" && request.url === "/") {
    const content = await fs.readFile("index.html", "utf-8");
    response.end(content);
  } else if (request.method === "GET" && request.url === "/login") {
    const content = await fs.readFile("login.html", "utf-8");
    response.end(content);
  } else if (request.method === "POST" && request.url === "/article") {
    const body = await new Promise((resolve, reject) => {
      let body = "";
      request.on("data", (chunk) => {
        body += chunk;
      });
      request.on("end", () => {
        resolve(body);
      });
      request.on("error", (err) => {
        reject(err);
      });
    });
    await fs.writeFile("article.json", body);
    response.statusCode = 201;
    response.end("Article created");
  } else if (request.method === "GET" && request.url === "/article") {
    const content = await fs.readFile("article.json", "utf-8");
    const data = JSON.parse(content);
    response.statusCode = 200;
    response.end(`<h1>${data.title}</h1>`);
  } else {
    response.statusCode = 404;
    response.end("<h1>Page not found</h1>");
  }
});

server.listen(3000);
