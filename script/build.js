import nunjucks from "nunjucks";
import fs from "fs/promises";
import { minify } from "html-minifier-terser";
import cleanCSS from "clean-css-promise";
import { minify as minifyJS } from "terser";
import path from "path";
import slugify from "@sindresorhus/slugify";

nunjucks.configure({ autoescape: true });

const args = process.argv.slice(2);
const isDev = args[0] === "dev";

const dataIndex = await getDataIndex(
  "./src/data/index.json",
  "./src/data/global.json",
  "./src/data/articles.json"
);
const dataLogin = await mergedDataWithGlobal("./src/data/login.json");
const data404 = await mergedDataWithGlobal("./src/data/404.json");

async function main() {
  await fs.rm("./dist", { recursive: true, force: true });
  await fs.mkdir("./dist");

  await Promise.all([
    handleCSS([
      {
        src: "./src/css/index.css",
        dist: "./dist/index.css",
      },
      {
        src: "./src/css/global.css",
        dist: "./dist/global.css",
      },
      {
        src: "./src/css/login.css",
        dist: "./dist/login.css",
      },
      {
        src: "./src/css/article.css",
        dist: "./dist/blog/article.css",
      },
      {
        src: "./src/css/articlesIndex.css",
        dist: "./dist/blog/articlesIndex.css",
      },
      {
        src: "./src/css/404.css",
        dist: "./dist/404.css",
      },
    ]),
    handleJS([
      {
        src: "./src/script/global.js",
        dist: "./dist/global.js",
      },
    ]),
    njkToHtml("./src/template/index.njk", "./dist/index.html", dataIndex),
    njkToHtml(
      "./src/template/indexArticles.njk",
      "./dist/blog/index.html",
      dataLogin
    ),
    njkToHtml("./src/template/login.njk", "./dist/login.html", dataLogin),
    njkToHtml("./src/template/404.njk", "./dist/404.html", data404),
    handleArticlesIndex("./dist/blog/index.html"),
    handleArticlePages("./src/template/article.njk"),
  ]);
}
main();
async function handleArticlesIndex(destPath) {
  const dataArticles = await addOpengraphUrlToArticle(
    "./src/data/articles.json"
  );
  const dataGlobal = await readJsonFile("./src/data/global.json");
  const dataArticlesIndex = await readJsonFile("./src/data/articlesIndex.json");
  const mergedData = { dataArticles, ...dataGlobal, ...dataArticlesIndex };
  await njkToHtml("./src/template/indexArticles.njk", destPath, mergedData);
}
async function handleArticlePages(templatePath) {
  const dataGlobal = await readJsonFile("./src/data/global.json");
  const dataArticles = await addOpengraphUrlToArticle(
    "./src/data/articles.json"
  );
  for (const article of dataArticles) {
    const data = {
      head: {
        titleTab: article.title,
        openGraphUrl: article.openGraphUrl,
        openGraphTitle: article.title,
        openGraphDescription: article.description,
        openGraphPicture: article.image,
        CSSglobal: "/global.css",
        CSS: "article.css",
      },
      article,
      ...dataGlobal,
    };
    const dest = `./dist${data.head.openGraphUrl}.html`;

    await njkToHtml(templatePath, dest, data);
  }
  console.info(`you have created ${dataArticles.length} articles page html`);
}
async function pathExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch (err) {
    return false;
  }
}
async function readJsonFile(path) {
  const dataJson = await fs.readFile(path, "utf8");
  const data = JSON.parse(dataJson);
  return data;
}
async function handleJS(arrOfSrcAndDest) {
  for (const { src, dist } of arrOfSrcAndDest) {
    if (!(await pathExists(path.dirname(dist)))) {
      await fs.mkdir(path.dirname(dist), { recursive: true });
    }
    const dataJS = await fs.readFile(src, "utf8");
    const minifiedJS = await minifyJS(dataJS, {
      compress: {
        drop_console: true,
        unsafe: true,
      },
      mangle: {
        reserved: ["jQuery"],
      },
      output: {
        comments: "some",
        beautify: false,
      },
    });
    if (!isDev) {
      await fs.writeFile(dist, minifiedJS.code);
      console.info(
        `The ${path.basename(src)} file has been minified and copied!`
      );
    } else {
      await fs.copyFile(src, dist);
      console.info(`The ${path.basename(src)} file has been copied!`);
    }
  }
}
async function handleCSS(arrOfSrcAndDest) {
  for (const { src, dist } of arrOfSrcAndDest) {
    if (!(await pathExists(path.dirname(dist)))) {
      await fs.mkdir(path.dirname(dist), { recursive: true });
    }
    if (isDev) {
      await fs.copyFile(src, dist);
      console.info(`The ${path.basename(src)} file has been copied!`);
    } else {
      const dataCSS = await fs.readFile(src, "utf8");
      const minifiedCSS = await new cleanCSS().minify(dataCSS);
      await fs.writeFile(dist, minifiedCSS.styles);
      console.info(
        `The ${path.basename(src)} file has been minified and copied!`
      );
    }
  }
}
async function createArticleSlug(title, id) {
  return `${slugify(title)}-${id}`;
}
async function mergedDataWithGlobal(pathData) {
  const [data, dataGlobal] = await Promise.all([
    readJsonFile(pathData),
    readJsonFile("./src/data/global.json"),
  ]);

  const mergedData = { ...data, ...dataGlobal };
  return mergedData;
}
async function getDataIndex(pathDataIndex, pathDataGlobal, pathDataArticles) {
  const [dataIndex, dataGlobal] = await Promise.all([
    readJsonFile(pathDataIndex),
    readJsonFile(pathDataGlobal),
  ]);
  const dataArticles = await addOpengraphUrlToArticle(pathDataArticles);
  const articlesHighlight = dataArticles.slice(0, 3);

  const mergedData = { ...dataGlobal, ...dataIndex, articlesHighlight };

  return mergedData;
}
async function njkToHtml(templatePath, dest, data) {
  const htmlPage = nunjucks.render(templatePath, data);

  if (!(await pathExists(path.dirname(dest)))) {
    await fs.mkdir(path.dirname(dest), { recursive: true });
  }

  if (isDev) {
    await fs.writeFile(dest, htmlPage);
  } else {
    const minified = await minify(htmlPage, {
      removeAttributeQuotes: true,
      collapseWhitespace: true,
      removeComments: true,
    });

    await fs.writeFile(dest, minified);
  }
}
async function addOpengraphUrlToArticle(pathArticles) {
  const dataArticles = await readJsonFile(pathArticles);
  const articles = [];
  for (const article of dataArticles) {
    const openGraphUrl = `/blog/${await createArticleSlug(
      article.title,
      article.id
    )}`;
    const articleWithUrl = { ...article, openGraphUrl };
    articles.push(articleWithUrl);
  }
  return articles;
}
