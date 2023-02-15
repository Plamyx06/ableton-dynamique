import fsp from "fs/promises";
import { faker } from "@faker-js/faker";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789qwertyuiopasdfghjklzxcvbnm", 10);

const arrOfCategories = [
  "Artist",
  "News",
  "Download",
  "Tutorials",
  "Videos",
  "Loop",
];
const ArrOfTags = [
  "Ableton Live, Music, Live 11, Daw, SongWritting, Session View",
  "Song, Live Performance, Made in Ableton Live, live11",
  "Live 11, Mixing, Mastering, EQing",
];

function generateFakeArticles() {
  const articles = [];

  for (const i of Array(100)) {
    const id = nanoid();
    const title = faker.lorem.sentence();
    const description = faker.lorem.paragraph();
    const category = getRandomFromArr(arrOfCategories);
    const content = faker.lorem.paragraphs(10);
    const image = faker.image.image();
    const tags = getRandomFromArr(ArrOfTags);

    const article = {
      id,
      title,
      description,
      category,
      content,
      image,
      tags,
    };

    articles.push(article);
  }
  return articles;
}
const articles = JSON.stringify(generateFakeArticles(), null, "\t");
await fsp.writeFile(
  "./src/data/articles.json",
  `{"articles":` + [articles] + "}"
);
console.log("articles.json created");

function getRandomFromArr(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}
