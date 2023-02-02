const nunjucks = require("nunjucks");
const data = require("./data/index.json");
const fsp = require("fs/promises");
const dataLogin = require("./data/login.json");
const { minify } = require("html-minifier-terser");
const cleanCSS = require("clean-css-promise");

const args = process.argv.slice(2).join("");
const boolArgsContainDev = argsContainDev(args);
const minifiedHtmlOption = {
  removeAttributeQuotes: true,
  collapseWhitespace: true,
  removeComments: true,
};

async function main() {
  try {
    await fsp.rm("./dist", { recursive: true, force: true });
    await fsp.mkdir("./dist");
    const templateIndex = nunjucks.render("./src/template/index.njk", data);
    const minifiedIndex = await minify(templateIndex, minifiedHtmlOption);
    if (boolArgsContainDev === true) {
      await (fsp.writeFile("./dist/index.html", templateIndex) &&
        console.log(`index.html file created`));
    } else {
      await (fsp.writeFile("./dist/index.html", minifiedIndex) &&
        console.log(`index.html file has been minified created`));
    }
    const dataIndexCSS = await fsp.readFile("./src/css/index.css", "utf8");
    const minifiedIndexCSS = await new cleanCSS().minify(dataIndexCSS);
    if (boolArgsContainDev === true) {
      await (fsp.copyFile("./src/css/index.css", "./dist/index.css") &&
        console.log("The index.css file copied!"));
    } else {
      await (fsp.writeFile("./dist/index.css", minifiedIndexCSS.styles) &&
        console.log("The index.css file has been minified and copied!"));
    }
    const dataGlobalCSS = await fsp.readFile("./src/css/global.css", "utf8");
    const minifiedGlobalCSS = await new cleanCSS().minify(dataGlobalCSS);
    if (boolArgsContainDev === true) {
      await (fsp.copyFile("./src/css/global.css", "./dist/global.css") &&
        console.log("The global.css file copied!"));
    } else {
      await (fsp.writeFile("./dist/global.css", minifiedGlobalCSS.styles) &&
        console.log("The global.css file has been minified and copied!"));
    }
    await fsp.mkdir("./dist/member");
    let templateLogin = nunjucks.render("./src/template/login.njk", dataLogin);
    let minifiedLogin = await minify(templateLogin, minifiedHtmlOption);
    if (boolArgsContainDev === true) {
      await (fsp.writeFile("./dist/member/login.html", templateLogin) &&
        console.log(`login.html file created`));
    } else {
      await (fsp.writeFile("./dist/member/login.html", minifiedLogin) &&
        console.log(`login.html file minified and created`));
    }
    const dataLoginCSS = await fsp.readFile("./src/css/login.css", "utf8");
    const minifiedLoginCSS = await new cleanCSS().minify(dataLoginCSS);
    if (boolArgsContainDev === true) {
      await (fsp.copyFile("./src/css/login.css", "./dist/member/login.css") &&
        console.log("The login.css file copied!"));
    } else {
      await (fsp.writeFile(
        "./dist/member/login.css",
        minifiedLoginCSS.styles
      ) && console.log("The login.css file has been minified and copied!"));
    }
    await (fsp.copyFile("./src/script/global.js", "./dist/global.js") &&
      console.log("global.js file copied"));
  } catch (err) {
    throw err;
  }
}

function argsContainDev(str) {
  if (str === "dev" || str === "Dev") {
    return true;
  } else return false;
}

main();
