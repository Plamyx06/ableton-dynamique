import http from "http";
import fs from "fs/promises";
import path from "path";
import mime from "mime-types";
import https from "https"



const PORT = 3000

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

    if (RequestUrl === "/blog/") {
      const options = {
        hostname: 'admin-ableton.up.railway.app',
        path: '/api/articles',
        method: 'GET'
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          const articles = JSON.parse(data)
          const filePath = "./src/data/articlesApi.json";
          fs.writeFile(filePath, JSON.stringify(articles, null, 2), (err) => {
            if (err) {
              console.error(err);
              return;
            }
            return filePath
          });
        });
      });

      req.on('error', (error) => {
        console.error(error);
      });
      console.log(`Les données ont été écrites dans le fichier articlesApi.json`)
      req.end();
    }

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
  }

  else {
    await render404(response, filePath, contentType);
  }
};

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
