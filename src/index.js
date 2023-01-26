const nunjucks = require("nunjucks");
const data = require("./data/index.json");
const fsp = require("fs/promises");
const dataLogin = require("./data/login.json");
const htmlMin = require("html-minifier");
const cleanCSS = require("clean-css");

nunjucks.configure({ autoescape: true });
let templateMenu = nunjucks.render("./src/template/index.njk", data);
let minifiedIndex = htmlMin.minify(templateMenu, {
  removeAttributeQuotes: true,
  collapseWhitespace: true,
  removeComments: true,
});
fsp
  .rm("./dist", { recursive: true, force: true })
  .catch((err) => {
    throw err;
  })
  .then(() =>
    fsp.mkdir("./dist").catch((err) => {
      throw err;
    })
  )
  .then(() => {
    fsp
      .writeFile("./dist/index.html", minifiedIndex)
      .catch((err) => {
        throw err;
      })
      .then(() => {
        console.log(`index.html file created`);
      });
  })
  .then(() => {
    fsp
      .readFile("./src/css/index.css", "utf8")
      .catch((err) => {
        throw err;
      })
      .then((data) => {
        let minifiedIndexCSS = new cleanCSS().minify(data).styles;
        fsp
          .writeFile("./dist/index.css", minifiedIndexCSS)
          .catch((err) => {
            throw err;
          })
          .then(() => {
            console.log("The index.css file has been minified and copied!");
          });
      });
  })
  .then(() => {
    fsp
      .readFile("./src/css/global.css", "utf8")
      .catch((err) => {
        throw err;
      })
      .then((data) => {
        let minifiedGlobalCSS = new cleanCSS().minify(data).styles;
        fsp
          .writeFile("./dist/global.css", minifiedGlobalCSS)
          .catch((err) => {
            throw err;
          })
          .then(() => {
            console.log("The global.css file has been minified and copied!");
          });
      });
  })
  .then(() => {
    fsp.mkdir("./dist/member").catch((err) => {
      throw err;
    });
  })
  .then(() => {
    let templateLogin = nunjucks.render("./src/template/login.njk", dataLogin);
    let minifiedLogin = htmlMin.minify(templateLogin, {
      removeAttributeQuotes: true,
      collapseWhitespace: true,
      removeComments: true,
    });
    fsp
      .writeFile("./dist/member/login.html", minifiedLogin)
      .catch((err) => {
        throw err;
      })
      .then(() => {
        console.log(`login.html file created`);
      });

    fsp
      .readFile("./src/css/login.css", "utf8")
      .catch((err) => {
        throw err;
      })
      .then((data) => {
        let minifiedLoginCSS = new cleanCSS().minify(data).styles;
        fsp
          .writeFile("./dist/member/login.css", minifiedLoginCSS)
          .catch((err) => {
            throw err;
          })
          .then(() => {
            console.log("The login.css file has been minified and copied!");
          });
      });
  });
