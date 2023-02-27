import nunjucks from "nunjucks";
import fs from "fs/promises";
import { minify } from "html-minifier-terser";
import cleanCSS from "clean-css-promise";
import { minify as minifyJS } from "terser";
import path from "path";
import slugify from "@sindresorhus/slugify";
import { cp } from "fs";
nunjucks.configure({ autoescape: true });

const args = process.argv.slice(2);
const isDev = args[0] === "dev";

const srcFileToDest = [
  {
    src: "./src/css/index.css",
    dist: "./dist/index.css",
  },
  {
    src: "./src/css/global.css",
    dist: "./dist/global.css",
  },
  {
    src: "./src/script/global.js",
    dist: "./dist/global.js",
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

async function main() {
  await fs.rm("./dist", { recursive: true, force: true });
  await fs.mkdir("./dist");

  await Promise.all([
  minifyCSSorJS(srcFileToDest),
  copyAllFilesIfIsDev(srcFileToDest),
   njkToHtmlDevOrMinify(
    "./src/template/index.njk",
    "./dist/index.html",
    "./src/data/index.json",
    "./src/data/global.json","./script/articles.json"
  ),
  njkToHtmlDevOrMinify(
    "./src/template/login.njk",
    "./dist/login.html",
    "./src/data/login.json",
    "./src/data/global.json",
  ),
   generateArticlePage("./src/template/blog.njk", "./dist/blog")])
}
main();
async function copyAllFilesIfIsDev(arrOfSrcAndDest) {
  if (isDev) {
    for (const { src, dist } of arrOfSrcAndDest) {
      if (!(await pathExists(path.dirname(dist)))) {
        await fs.mkdir(path.dirname(dist), { recursive: true });
      }
      await fs.copyFile(src, dist);
      console.log(
        `The file ${path.basename(src)} has been successfully copied!`
      );
    }
  } else {
    return;
  }
}

async function minifyCSSorJS(arrOfSrcAndDest) {
  if (!isDev) {
    for (const { src, dist } of arrOfSrcAndDest) {
      if (!(await pathExists(path.dirname(dist)))) {
        await fs.mkdir(path.dirname(dist), { recursive: true });
      }
      const fileExtension = path.extname(src);
      if (fileExtension === ".css") {
        const dataCSS = await fs.readFile(src, "utf8");
        const minifiedCSS = await new cleanCSS().minify(dataCSS);
        await fs.writeFile(dist, minifiedCSS.styles);

        console.log(
          `The ${path.basename(src)} file has been minified and copied!`
        );
      } else if (fileExtension === ".js") {
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
        await fs.writeFile(dist, minifiedJS.code);
        console.log(
          `The ${path.basename(src)} file has been minified and copied!`
        );
      } else {
        throw new err(`${fileExtension} not supported`);
      }
    }
  } else {
    return;
  }
}

async function generateArticlePage(templatePath, destPath) {
 
  if (!(await pathExists(destPath))) {
    await fs.mkdir(destPath, { recursive: true });
  }
  const [articlesData, dataGlobal] = await Promise.all([
    readJsonFile("./script/articles.json"),
    readJsonFile("./src/data/global.json"),
  ]);
  const articlesHighlight = articlesData.slice(0, 3);

const articlesHighlightWithUrls = articlesHighlight.map(article => {
  const openGraphUrl = `/blog/${slugify(article.title)}-${article.id}.html`;
  return {
    ...article,
    openGraphUrl
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
async function njkToHtmlDevOrMinify(
  templatePath,
  dest,
  PathJson,
  PathGlobaljson,
  pathArticlesJson
) {
  const data = await readJsonFile(PathJson);
  const dataGlobal = await readJsonFile(PathGlobaljson);

  if (path.basename(dest) === "index.html") {
  const dataArticles = await readJsonFile(pathArticlesJson);
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
