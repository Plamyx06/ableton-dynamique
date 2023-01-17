const nunjucks = require("nunjucks");
const data = require("./data/contentEn.json");
const fs = require("fs");
const dataLogin = require("./data/contentEnLogin.json");

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
      console.log("Le fichier index.css a été copié!");
    });
    fs.copyFile("./src/css/global.css", "./dist/global.css", (err) => {
      if (err) throw err;
      console.log("Le fichier global.css a été copié!");
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
        console.log("Le fichier login.css a été copié!");
      });
    });
  });
});
