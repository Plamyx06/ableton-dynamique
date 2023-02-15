import nunjucks from "nunjucks";
import fsp from "fs/promises";
import { minify } from "html-minifier-terser";
import cleanCSS from "clean-css-promise";
import { minify as minifyJS } from "terser";
import path from "path";
const [dataIndex, dataLogin] = await Promise.all([
  fsp
    .readFile("./src/data/index.json", "utf8")
    .then((data) => JSON.parse(data)),
  fsp
    .readFile("./src/data/login.json", "utf8")
    .then((data) => JSON.parse(data)),
]);

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

async function main() {
  await fsp.rm("./dist", { recursive: true, force: true });
  await fsp.mkdir("./dist");
  await fsp.mkdir("./dist/member");
  const templateIndex = nunjucks.render("./src/template/index.njk", dataIndex);
  const templateLogin = nunjucks.render("./src/template/login.njk", dataLogin);

  if (isDev) {
    Promise.all([
      copyAllFiles(
        [
          "./src/css/index.css",
          "./src/css/global.css",
          "./src/script/global.js",
          "./src/css/login.css",
        ],
        [
          "./dist/index.css",
          "./dist/global.css",
          "./dist/global.js",
          "./dist/member/login.css",
        ]
      ),
      fsp.writeFile("./dist/index.html", templateIndex),
      console.log("index.html file created"),
      fsp.writeFile("./dist/member/login.html", templateLogin),
      console.log(`login.html file created`),
    ]);
  } else {
    Promise.all([
      minifyHTML(templateIndex, "./dist/index.html"),
      minifyHTML(templateLogin, "./dist/member/login.html"),
      minifiedCSSorJS(
        [
          "./src/css/index.css",
          "./src/css/global.css",
          "./src/css/login.css",
          "./src/script/global.js",
        ],
        [
          "./dist/index.css",
          "./dist/global.css",
          "./dist/member/login.css",
          "./dist/global.js",
        ]
      ),
    ]);
  }
}

main();

async function minifyHTML(template, dist) {
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
    const fileExtension = path.extname(srcArray[i]);

    if (fileExtension === ".css") {
      Promise.all([
        fsp
          .readFile(srcArray[i], "utf8")
          .then((dataCSS) => new cleanCSS().minify(dataCSS))
          .then((minifiedCSS) =>
            fsp.writeFile(distArray[i], minifiedCSS.styles)
          )
          .then(() =>
            console.log(
              `The ${path.basename(
                srcArray[i]
              )} file has been minified and copied!`
            )
          ),
      ]);
    } else if (fileExtension === ".js") {
      Promise.all([
        fsp
          .readFile(srcArray[i], "utf8")
          .then((dataJS) => minifyJS(dataJS, optionJsMinified))
          .then((JSMinified) => fsp.writeFile(distArray[i], JSMinified.code))
          .then(() =>
            console.log(
              `The ${path.basename(
                srcArray[i]
              )} file has been minified and copied!`
            )
          ),
      ]);
    } else {
      throw new err(`${fileExtension} not supported`);
    }
  }
}

async function copyAllFiles(srcArray, distArray) {
  for (let i = 0; i < srcArray.length; i++) {
    await fsp.copyFile(srcArray[i], distArray[i]);
    console.log(
      `The file ${path.basename(srcArray[i])} has been successfully copied!`
    );
  }
}
