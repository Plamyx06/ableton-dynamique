import nunjucks from "nunjucks";
import fs from "fs";

/*const dataBlog = await fsp
  .readFile("./src/data/articles.json", "utf8")
  .then((data) => JSON.parse(data));

const templateBlog = nunjucks.render("./src/template/blog.njk", dataBlog);

await fsp.rm("./dist/blog", { recursive: true, force: true });
await fsp.mkdir("./dist/blog");
await fsp.writeFile("./dist/blog/blog.html", templateBlog),
  console.log("index.html file created");
*/

// Charger les articles depuis un fichier JSON
const articles = JSON.parse(fs.readFileSync("./src/data/articles.json"));

// Initialiser Nunjucks
const env = nunjucks.configure("templates");

// Parcourir tous les articles
for (let i = 0; i < articles.length; i++) {
  // Récupérer l'article courant
  const article = articles[i];

  // Générer le contenu HTML avec la template Nunjucks
  const html = env.render("article.html", { article: article });

  // Sauvegarder le contenu HTML dans un fichier
  fs.writeFileSync(`./dist/blog/article-${i + 1}.html`, html);
}
