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

const srcFileCSSToDest = [
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
];
const srcFileJSToDest = [
  {
    src: "./src/script/global.js",
    dist: "./dist/global.js",
  },
];
const srcJson = {
  index: "./src/data/index.json",
  login: "./src/data/login.json",
  global: "./src/data/global.json",
  article: "./src/data/articles.json",
};
const srcTemplate = {
  index: "./src/template/index.njk",
  login: "./src/template/login.njk",
  blog: "./src/template/blog.njk",
};

async function main() {
  await fs.rm("./dist", { recursive: true, force: true });
  await fs.mkdir("./dist");

  await Promise.all([
    handleCSS(srcFileCSSToDest),
    njkToHtml(srcTemplate.index, "./dist/index.html", srcJson),
    njkToHtml(srcTemplate.login, "./dist/login.html", srcJson),
    handleJS(srcFileJSToDest),
    handleArticlePages(srcTemplate.blog, "./dist/blog"),
  ]);
}
main();

async function handleArticlePages(templatePath, destPath) {
  if (!(await pathExists(destPath))) {
    await fs.mkdir(destPath, { recursive: true });
  }
  const [articlesData, dataGlobal] = await Promise.all([
    readJsonFile("./src/data/articles.json"),
    readJsonFile("./src/data/global.json"),
  ]);
  const articlesHighlight = articlesData.slice(0, 3);

  const articlesHighlightWithUrls = articlesHighlight.map((article) => {
    const openGraphUrl = `/blog/${slugify(article.title)}-${article.id}.html`;
    return {
      ...article,
      openGraphUrl,
    };
  });

  for (const article of articlesData) {
    const dest = `${destPath}/${slugify(article.title)}-${article.id}.html`;
    const data = {
      head: {
        titleTab: article.title,
        openGraphUrl: dest,
        openGraphTitle: article.title,
        openGraphDescription: article.description,
        openGraphPicture: article.image,
        CSSglobal: "/global.css",
        CSS: "article.css",
      },
      articlesHighlightWithUrls,
      article,
      ...dataGlobal,
    };
    const htmlPage = nunjucks.render(templatePath, data);
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
  if (isDev) {
    console.info(`you have created ${articlesData.length} articles page html`);
  } else {
    console.info(
      `you have created ${articlesData.length} articles page html minified`
    );
  }
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
    if (!isDev) {
      const dataCSS = await fs.readFile(src, "utf8");
      const minifiedCSS = await new cleanCSS().minify(dataCSS);
      await fs.writeFile(dist, minifiedCSS.styles);

      console.info(
        `The ${path.basename(src)} file has been minified and copied!`
      );
    } else {
      await fs.copyFile(src, dist);
      console.info(`The ${path.basename(src)} file has been copied!`);
    }
  }
}
async function njkToHtml(templatePath, dest, dataJson) {
  const filename = path.basename(dest, ".html");

  const data = await readJsonFile(dataJson[filename]);
  const dataGlobal = await readJsonFile(dataJson.global);

  if (path.basename(dest) === "index.html") {
    const dataArticles = await readJsonFile(dataJson.article);
    const articlesHighlight = [];
    for (const article of dataArticles.slice(0, 3)) {
      const openGraphUrl = `/blog/${slugify(article.title)}-${article.id}.html`;
      const articleWithHighlight = { ...article, openGraphUrl };
      articlesHighlight.push(articleWithHighlight);
    }
    data.articlesHighlight = articlesHighlight;
  }

  const mergedData = { ...dataGlobal, ...data };
  const htmlPage = nunjucks.render(templatePath, mergedData);

  if (!(await pathExists(path.dirname(dest)))) {
    await fs.mkdir(path.dirname(dest), { recursive: true });
  }

  if (isDev) {
    await fs.writeFile(dest, htmlPage);
    console.log(`${path.basename(dest)} is created!`);
  } else {
    const minified = await minify(htmlPage, {
      removeAttributeQuotes: true,
      collapseWhitespace: true,
      removeComments: true,
    });
    await fs.writeFile(dest, minified);
    console.log(
      `The file ${path.basename(dest)} has been minified and created.`
    );
  }
}
