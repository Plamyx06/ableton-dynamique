
import http from "http";
import fs from "fs/promises";
import path from "path";


const server = http.createServer(async (request, response) => {
  let contentType = "text/html"


  if (request.method === "GET") {
    let filePath = "./dist" + request.url;
    console.log({ requestURL })
    if (filePath.endsWith(".css")) {
      contentType = "text/css";
    } else if (filePath.endsWith(".js")) {
      contentType = "application/javascript";

    } else if (!filePath.endsWith(".html")) {
      filePath = filePath + ".html"
    }
    if (request.url === "/login") {
      filePath = filePath + ".html"

    }
    if (request.url === filePath.endsWith(".html")) {
      filePath = "./dist/global.js";
    }
    console.log({ filePath })
    if ((await pathExists(filePath)) && (await isFile(filePath))) {

      const content = await fs.readFile(filePath, "utf-8");
      response.setHeader("Content-type", contentType);

      response.end(content);
    } else {
      response.statusCode = 404;
      response.end("<h1>Page not found</h1>");
    }
  }
});

server.listen(3000)//, () => {
//console.log("http://localhost:3000");
//});

async function pathExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch (err) {
    return false;
  }
}

async function isFile(filePath) {
  const stats = await fs.stat(filePath);
  return stats.isFile();
}
async function removeExtensionsHTML(filePath) {
  const fileExtension = path.extname(filePath);
  console.log({ fileExtension })
  if (fileExtension === ".html") {
    const fileName = path.basename(filePath, fileExtension);
    const pathWithoutExtension = path.join(path.dirname(filePath), fileName);
    return pathWithoutExtension;
  }
  else return filePath

}
async function isDir(filePath) {
  const stats = await fs.stat(filePath);
  return stats.isDirectory();
}

/*file path sans extension!
si c'est un dossier -> / -> index.html 
si c'est un fichier -> filepath + ".html"*/