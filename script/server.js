import http from "http";
import fs from "fs/promises";
import path from "path";
import mime from "mime-types";

const PORT = 3020;

const server = http.createServer(async (request, response) => {
  try {
    await handleServer(request, response);
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end("Internal server error");
  }
});

async function handleServer(request, response) {
  const requestURLData = new URL(request.url, `http://localhost:${PORT}`);
  console.info(`\n---\nRequest ${new Date().getTime()}`, {
    method: request.method,
    url: request.url,
    requestURLData,
  });

  let contentType = "text/html";
  if (request.method === "GET") {
    const RequestUrl = request.url;

    const extname = path.extname(RequestUrl);

    let filePath = `./dist${RequestUrl}`;
    if (await isDir(filePath)) {
      filePath += "index";
    }
    if (extname === "") {
      filePath += ".html";

      if ((await pathExists(filePath)) && (await isFile(filePath))) {
        await renderContent(response, filePath, contentType);
      } else {
        await render404(response, filePath, contentType);
      }
    } else if (
      (await pathExists(filePath)) &&
      (await isFile(filePath)) &&
      extname !== ".html"
    ) {
      await renderContent(response, filePath, contentType);
    } else {
      await render404(response, filePath, contentType);
    }
  } else {
    await render404(response, filePath, contentType);
  }
}

server.listen(3000, () => {
  console.log("http://localhost:3000");
});

async function pathExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch (err) {
    return false;
  }
}
async function isFile(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch (error) {
    return false;
  }
}
async function isDir(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isDirectory();
  } catch (error) {
    return false;
  }
}
async function render404(response, filePath, contentType) {
  contentType = mime.contentType(path.extname(filePath));
  const content = await fs.readFile("./dist/404.html", "utf-8");
  response.setHeader("Content-type", contentType);
  response.statusCode = 404;
  response.end(content);
}
async function renderContent(response, filePath, contentType) {
  contentType = mime.contentType(path.extname(filePath));
  const content = await fs.readFile(filePath, "utf-8");
  response.setHeader("Content-type", contentType);
  response.end(content);
}
