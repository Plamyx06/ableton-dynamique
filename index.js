const fs = require("fs");
const nunjucks = require("nunjucks");
const JsonContent = require("./src/data/contentEn.json");

nunjucks.configure({ autoescape: true });
nunjucks.render("./src/template/index.njk", JsonContent, function (err, data) {
  if (err) {
    throw err;
  }
  fs.writeFile("./dist/index.html", data, (err) => {
    if (err) {
      throw err;
    }
    console.log(`Fichier index.html créé`);
  });
});
