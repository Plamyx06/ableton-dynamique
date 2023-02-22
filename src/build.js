import nunjucks from "nunjucks";
import fsp from "fs/promises";
import { minify } from "html-minifier-terser";
import cleanCSS from "clean-css-promise";
import { minify as minifyJS } from "terser";
import path from "path";
import slugify from "@sindresorhus/slugify";
nunjucks.configure({ autoescape: true });

const dataIndex = await readJsonFile("./src/data/index.json");
const dataLogin = await readJsonFile("./src/data/login.json");

const args = process.argv.slice(2);
const isDev = args[0] === "dev";

const optionJsMinified = {
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
};
const srcFileToDist = {
  "./src/css/index.css": "./dist/index.css",
  "./src/css/global.css": "./dist/global.css",
  "./src/script/global.js": "./dist/global.js",
  "./src/css/login.css": "./dist/member/login.css",
  "./src/css/article.css": "./dist/blog/article.css",
};
async function main() {
  await fsp.rm("./dist", { recursive: true, force: true });
  await fsp.mkdir("./dist");

  const templateIndex = nunjucks.render("./src/template/index.njk", dataIndex);
  const templateLogin = nunjucks.render("./src/template/login.njk", dataLogin);

  if (isDev) {
    await copyAllFiles(
      Object.keys(srcFileToDist),
      Object.values(srcFileToDist)
    );
    Promise.all([
      fsp.writeFile("./dist/index.html", templateIndex),
      console.log("index.html file created"),
      fsp.writeFile("./dist/member/login.html", templateLogin),
      console.log(`login.html file created`),
      generateArticlePage("./src/template/blog.njk", "./dist/blog"),
    ]);
  } else {
    Promise.all([
      minifyHTML(templateIndex, "./dist/index.html"),
      minifyHTML(templateLogin, "./dist/member/login.html"),
      minifiedCSSorJS(Object.keys(srcFileToDist), Object.values(srcFileToDist)),
    ]);
  }
}
main();

async function minifyHTML(template, dist) {
  if (!(await pathExists(path.dirname(dist)))) {
    await fsp.mkdir(path.dirname(dist), { recursive: true });
  }
  console.log(path.dirname(dist));
  const minifiedHtmlOption = {
    removeAttributeQuotes: true,
    collapseWhitespace: true,
    removeComments: true,
  };
  const minified = await minify(template, minifiedHtmlOption);
  await fsp.writeFile(dist, minified);
  console.log(`The file ${path.basename(dist)} has been minified and created.`);
}
async function minifiedCSSorJS(srcArray, distArray) {
  for (let i = 0; i < srcArray.length; i++) {
    if (!(await pathExists(path.dirname(distArray[i])))) {
      await fsp.mkdir(path.dirname(distArray[i]));
    }
    const fileExtension = path.extname(srcArray[i]);
    if (fileExtension === ".css") {
      await fsp
        .readFile(srcArray[i], "utf8")
        .then((dataCSS) => new cleanCSS().minify(dataCSS))
        .then((minifiedCSS) => fsp.writeFile(distArray[i], minifiedCSS.styles))
        .then(() =>
          console.log(
            `The ${path.basename(
              srcArray[i]
            )} file has been minified and copied!`
          )
        );
    } else if (fileExtension === ".js") {
      await fsp
        .readFile(srcArray[i], "utf8")
        .then((dataJS) => minifyJS(dataJS, optionJsMinified))
        .then((JSMinified) => fsp.writeFile(distArray[i], JSMinified.code))
        .then(() =>
          console.log(
            `The ${path.basename(
              srcArray[i]
            )} file has been minified and copied!`
          )
        );
    } else {
      throw new err(`${fileExtension} not supported`);
    }
  }
}
async function copyAllFiles(srcArray, distArray) {
  for (let i = 0; i < srcArray.length; i++) {
    if (!(await pathExists(path.dirname(distArray[i])))) {
      await fsp.mkdir(path.dirname(distArray[i]), { recursive: true });
    }
    await fsp.copyFile(srcArray[i], distArray[i]);
    console.log(
      `The file ${path.basename(srcArray[i])} has been successfully copied!`
    );
  }
}
async function readJsonFile(path) {
  const dataJson = await fsp.readFile(path, "utf8");
  const data = JSON.parse(dataJson);
  return data;
}
async function generateArticlePage(templatePath, destFolder) {
  if (!(await pathExists(path.dirname(destFolder)))) {
    await fsp.mkdir(path.dirname(destFolder), { recursive: true });
  }
  const articlesData = await readJsonFile("./src/data/articles.json");
  const articles = articlesData.articles;
  const indexData = await readJsonFile("./src/data/index.json");

  const articleHighlight = articles.slice(0, 3);
  for (let article of articleHighlight) {
    article.openGraphUrl = `/blog/${slugify(article.title)}-${article.id}.html`;
  }
  indexData.articleHighlight = articleHighlight;

  await fsp.writeFile(
    "./src/data/index.json",
    JSON.stringify(indexData, null, "\t")
  );

  for (const article of articles) {
    const data = {
      head: {
        titleTab: article.title,
        openGraphUrl: `/blog/${slugify(article.title)}-${article.id}.html`,
        openGraphTitle: article.title,
        openGraphDescription: article.description,
        openGraphPicture: article.image,
        CSSglobal: "/global.css",
        CSS: "article.css",
      },
      navlinks: [
        {
          title: "Push",
          href: "https://www.ableton.com/en/push/",
        },
        { title: "Link", href: "https://www.ableton.com/en/link/" },
        {
          title: "Shop",
          href: "https://www.ableton.com/en/shop/",
        },
        {
          title: "Packs",
          href: "https://www.ableton.com/en/packs/",
        },
        {
          title: "Help",
          href: "https://www.ableton.com/en/help/",
        },
      ],
      navlinkTry: {
        title: "Try live for free",
        href: "https://www.ableton.com/en/trial/",
      },
      navlinkLogIn: {
        title: "Login or register",
        href: "/member/login.html",
      },
      navbarButton: {
        title: "More",
        title2: "+",
        href: "",
      },
      navlinkMobile: {
        title: "Menu",
      },
      mainFooter1: {
        title: "Sign up to our newsletter",
        helpTxt:
          "Enter your email address to stay up to date with the latest offers, tutorials, downloads, surveys and more.",
        placeholder: "Email Address",
        button: "Sign up",
      },
      mainFooter2: [
        {
          title: "Register Live or Push >",
          href: "https://www.ableton.com/en/login/?next=/en/account/add_license/",
        },
        {
          title: "About Ableton >",
          href: "https://www.ableton.com/en/about/",
        },
        {
          title: "Jobs >",
          href: "https://www.ableton.com/en/jobs/",
        },
      ],
      Footer3: {
        mainTitle: "Education",
      },
      mainFooter3: [
        {
          title: "Offers for students and teachers >",
          href: "https://www.ableton.com/en/shop/education/",
        },
        {
          title: "Ableton for the classroom >",
          href: "https://www.ableton.com/en/classroom/",
        },
        {
          title: "Ableton for Colleges and Universities >",
          href: "https://www.ableton.com/en/colleges-universities/",
        },
      ],
      articleHighlight,
      article,
    };

    const html = nunjucks.render(templatePath, data);
    await fsp.writeFile(
      `${destFolder}/${slugify(article.title)}-${article.id}.html`,
      html
    );
  }
  console.info(`you have created ${articles.length} articles`);
}
async function pathExists(path) {
  try {
    await fsp.access(path);
    return true;
  } catch (err) {
    return false;
  }
}
