import fs from "fs/promises";
import nunjucks from "nunjucks";

async function generateArticlePage(templateName, destFolder) {
  const articlesData = await fs.readFile("./src/data/articles.json", "utf-8");
  const articles = JSON.parse(articlesData).articles;
  const navData = await fs.readFile("./src/data/index.json", "utf-8");
  const navbar = JSON.parse(navData).articles;

  const env = nunjucks.configure("./src/template", { autoescape: true });

  await fs.rm(destFolder, { recursive: true, force: true });
  await fs.mkdir(destFolder);
  const html = env.render(templateName, navbar);
  for (const article of articles) {
    await fs.writeFile(`${destFolder}/${article.title}.html`, html);
  }
  console.info("les articles ont tous était crée");
}

generateArticlePage("blog.njk", "./dist/blog");
