const fs = require("fs");
const nunjucks = require("nunjucks");
const JsonContent = require("./contentEn.json");

nunjucks.configure({ autoescape: true });
nunjucks.render("index.njk", JsonContent, function (err, data) {
  if (err) {
    throw new err();
  }
  fs.writeFile("index.html", data, (err) => {
    if (err) {
      throw new err();
    }
    console.log(`Fichier index.html créé`);
  });
});
