
import http from "http";
import fs from "fs/promises";
import path from "path";


const server = http.createServer(async (request, response) => {
  let contentType = "text/html"
  if (request.method === "GET") {

    const url = request.url;
    let filePath = `./dist${url}`;

    if (filePath.endsWith(".css")) {
      contentType = "text/css";
    } else if (filePath.endsWith(".js")) {
      contentType = "application/javascript";
    }

    console.log(await isDir(filePath))
    if (await isDir(filePath)) {
      filePath += "/index";
    }
    if (url === "/blog/404.css") {
      filePath = "./dist/404.css"
    }
    if (!filePath.endsWith(".js") && !filePath.endsWith(".css")) {
      filePath = filePath + ".html";
    }

    if ((await pathExists(filePath)) && (await isFile(filePath))) {

      const content = await fs.readFile(filePath, "utf-8");
      response.setHeader("Content-type", contentType);
      response.end(content);
    } else {
      const content = await fs.readFile("./dist/404.html", "utf-8");
      response.setHeader("Content-type", contentType);
      response.statusCode = 404;
      response.end(content);
    }
  }
}
);

server.listen(3000), () => {
  console.log("http://localhost:3000");
}

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