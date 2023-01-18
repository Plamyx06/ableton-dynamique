const nunjucks = require("nunjucks");
const data = require("./data/index.json");
const fs = require("fs");
const dataLogin = require("./data/Login.json");

nunjucks.configure({ autoescape: true });

let templateMenu = nunjucks.render("./src/template/index.njk", data);

fs.rm("./dist", { recursive: true, force: true }, (err) => {
  if (err) {
    throw err;
  }
  fs.mkdir("./dist", function (error) {
    if (error) {
      throw error;
    }
    fs.writeFile("./dist/index.html", templateMenu, (err) => {
      if (err) {
        throw err;
      }
      console.log(`index.html file created`);
    });
    fs.copyFile("./src/css/index.css", "./dist/index.css", (err) => {
      if (err) throw err;
      console.log("The index.css file has been copied!");
    });
    fs.copyFile("./src/css/global.css", "./dist/global.css", (err) => {
      if (err) throw err;
      console.log("The global.css file has been copied!");
    });

    fs.mkdir("./dist/member", function (error) {
      if (error) {
        throw error;
      }
      let templateLogin = nunjucks.render(
        "./src/template/login.njk",
        dataLogin
      );
      fs.writeFile("./dist/member/login.html", templateLogin, (err) => {
        if (err) {
          throw err;
        }
        console.log(`login.html file created`);
      });
      fs.copyFile("./src/css/login.css", "./dist/member/login.css", (err) => {
        if (err) throw err;
        console.log("The login.css file has been copied");
      });
    });
  });
});
