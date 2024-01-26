import nunjucks from "nunjucks";
import fs from "fs/promises";
import { minify } from "html-minifier-terser";
import cleanCSS from "clean-css-promise";
import { minify as minifyJS } from "terser";
import path from "path";
import slugify from "@sindresorhus/slugify";

let env = nunjucks.configure({
  noCache: true,
});
env.addFilter("getPropertyById", getPropertyById);

const args = process.argv.slice(2);
const isDev = args[0] === "dev";

const apiArticles = await getApiData("/api/articles");
const apiArticlesCategory = await getApiData("/api/articles-categories");
const apiFooter = await getApiData("/api/footer");
const apiHeader = await getApiData("/api/header");
const apiFooterHeaderMerged = { apiHeader, apiFooter };
const dataHomepage = await getDataIndex(
  "./src/data/index.json",
  await getApiData("/api/articles")
);
const dataLogin = {
  ...(await readJsonFile("./src/data/login.json")),
  ...apiFooterHeaderMerged,
};
const data404 = {
  ...(await readJsonFile("./src/data/404.json")),
  ...apiFooterHeaderMerged,
};

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
    njkToHtml("./src/template/index.njk", "./dist/index.html", dataHomepage),

    njkToHtml(
      "./src/template/indexArticles.njk",
      "./dist/blog/index.html",
      dataHomepage
    ),
    njkToHtml("./src/template/login.njk", "./dist/login.html", dataLogin),
    njkToHtml("./src/template/404.njk", "./dist/404.html", data404),
    handleArticlesIndex("./dist/blog/index.html"),
    handleArticlePages("./src/template/article.njk"),
  ]);
}
main();

async function handleArticlesIndex(destPath) {
  const dataArticles = await addOpengraphUrlToArticle(apiArticles);
  const dataGlobal = apiFooterHeaderMerged;
  const dataArticlesIndex = await readJsonFile("./src/data/articlesIndex.json");
  const mergedData = { dataArticles, ...dataGlobal, ...dataArticlesIndex };
  await njkToHtml("./src/template/indexArticles.njk", destPath, mergedData);
}
async function handleArticlePages(templatePath) {
  const dataGlobal = apiFooterHeaderMerged;
  const dataCategory = apiArticlesCategory;
  const dataArticles = await addOpengraphUrlToArticle(apiArticles);
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
      dataCategory,
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
async function getDataIndex(pathDataIndex, apiArticles) {
  const dataIndex = await readJsonFile(pathDataIndex);

  const dataGlobal = apiFooterHeaderMerged;
  const dataArticles = await addOpengraphUrlToArticle(apiArticles);
  const articlesHighlight = dataArticles.slice(0, 3);

  const mergedData = { ...dataGlobal, ...dataIndex, articlesHighlight };

  return mergedData;
}
async function njkToHtml(templatePath, dest, data) {
  try {
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
  } catch (error) {
    // Gérer l'erreur ici
    console.error("Une erreur s'est produite :", error);
  }
}
async function addOpengraphUrlToArticle(apiArticles) {
  const dataCategory = apiArticlesCategory;
  const dataArticles = apiArticles;
  const articles = [];
  for (const article of dataArticles) {
    const openGraphUrl = `/blog/${await createArticleSlug(
      article.title,
      article.id
    )}`;
    const categoryId = article.categoryId;

    const category = dataCategory.find((cat) => cat.categoryId === categoryId);
    const articleWithUrlAndCategory = {
      ...article,
      openGraphUrl,
      category: category.name,
    };
    articles.push(articleWithUrlAndCategory);
  }

  return articles;
}
async function getApiData(apiPath) {
  const url = `https://admin-ableton.up.railway.app${apiPath}`;

  const options = {
    method: "GET",
    headers: {
      Authorization: "lemotdepassecpasse",
    },
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw new Error(error);
  }
}
function getPropertyById(id, data) {
  const result = data.find((item) => item.id === id);

  return result.name;
}
