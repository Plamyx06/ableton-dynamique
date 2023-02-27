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
  "Ableton Live",
  "Music",
  "Live 11",
  "Daw",
  "Songwriting",
  "Session View",
  "Song",
  "Live Performance",
  "Made in Ableton Live",
  "Live 11",
  "Mixing",
  "Mastering",
  "EQing",
];

function generateFakeArticles() {
  const articles = [
    {
      id: "19pnw03751",
      title:
        "Friends, not Samples: The Soft Pink Truth on Collaboration and Pleasure",
      description:
        "“If I had to boil it down to a slogan it'd be like, ‘Friends, not samples,’” jokes Drew Daniel of his recent music. Daniel is best known as one half of the duo Matmos, who are famous for doing extraordinary things with unlikely sound sources: a washing machine; the sounds of plastic surgery; the audio archive of a Polish avant-garde composer. In the hands of Daniel and his partner in Matmos (and in life) M.C. Schmidt, samples can do, and mean, all sorts of things. They can comment on our world, draw attention to the unnoticed, or make us laugh. But samples can also give us misleading ideas about creativity.",
      category: "Artist",
      content:
        "From there, Daniel established a working method. Collaborators would play along to his works in progress, often just “demos of basic rhythms and chord shapes.” He would drop their recordings into Live and process them using a range of tools, including Live’s Sampler instruments and the convert to harmony function. “The album would not exist, really, without convert to harmony,” he says. “I'm too stupid to listen to somebody playing guitar and go like, what's the chord? But this system lets you produce a kind of trace, and its unreliability gives you this funny little grit of chaos that you can use to grow something cool. I’m trimming this little bonsai tree of MIDI information, and getting it to grow in the right way.” Working with collaborators was far from a linear process. Early on, Daniel created a single 25-minute track from their contributions, which he ended up “cannibalizing and demolishing” to create “a suite of seven or eight new songs.” The players might also spark new ideas. “Often I would have people sing or play along with a demo of one song, and I would take what they gave me and cut it in half. Half I would use for the original song and half I would extract and turn into, like, tissue samples to grow an entirely new song. So it became this branching structure. That's why a lot of the songs use the same chords and are the same tempo.”",
      image:
        "https://cdn-resources.ableton.com/resources/filer_thumbnails/misc-downloads/drew_daniel_by_niclas_weber_ggtN8LA.jpg__2787.0x1393.0_q85_subsampling-2.jpg",
      tags: ["Disco", "Collaboration"],
    },
    {
      id: "1zbizek8um",
      title: "George FitzGerald: Personal Stamp",
      description:
        "When music makers talk about improvements to their creative flow, they’re usually referring to a new instrument, an untapped sound source or perhaps a fresh approach to processing. They’re rarely referring to the unfinished sketches and dead ends that litter their hard drives. But for George FitzGerald, these eight-bar loops and patch experiments can be the spark that ignites a project and sends it in a new, more interesting direction.",
      category: "Artist",
      content:
        "FitzGerald has a considered, intentional sound, which makes it hard to picture him dragging and dropping unused bits and pieces into a track until something clicks. But that’s exactly what he’s done throughout his career – even before it was possible to grab parts from other projects within the browser and test them out.“Sometimes you pull one of these tracks from another project in, drop it a couple of semitones to match the key and it works really well,” says FitzGerald, “But quite often have to work with it a little bit. The main thing is it's not a piece of source material that you have come up with that day, so it's almost like you've taken a half-hour break and somebody else has sat at the chair and tried some stuff out. Then you've come back and you're trying to make that stuff work. I always find that gives you other perspectives. It seems like a really mundane feature of Live, but it's completely central to the way I work on it.”",
      image:
        "https://cdn-resources.ableton.com/resources/filer_thumbnails/misc-downloads/346_georgefitzgerald6.jpg__800.0x400.0_q85_subsampling-2.jpg",
      tags: [
        " Sound Design",
        " Warping",
        "Wavetable",
        "EQ Eight",
        "Live 11",
        "Comping",
      ],
    },
    {
      id: "043400u1p9",
      title: "Tennyson: Storytelling With Production",
      description:
        "Luke Pretty, aka Tennyson, has discovered a foolproof way to harness his productivity. “If people are watching me, I feel forced to work. So I do a lot of live streams. I’ll usually call a session ‘Eight hour live stream’ or something, and then I’m screwed,” he laughs. “Like, I have to just sit down for eight hours and work.”",
      category: "Loop",
      content:
        "It might seem surprising that Luke, who’s been releasing music for a decade, still feels he needs to find strategies to get him into writing mode. But the technique pays off. “I don’t really even understand it. When something goes right you can replay the footage, and I have no idea what happened or what went right. But I know it works.”On Rot, Tennyson’s first full-length LP, released in February, the results speak for themselves. The production is immaculate, and despite the eye-watering amount of samples and other sounds that feature on each track, everything fits together seamlessly. No two songs seem to belong to the same genre or convey the same mood, but they all share the same playful energy, accompanied in nearly every instance by Luke’s own warm, soulful vocals.Growing up in Edmonton, Canada, inspiration came to Luke from a variety of sources, some of them less conscious than others. “I grew up listening to a lot of introspective electronic music, like James Blake and Boards of Canada,” he explains. “I’d just spend hours and hours listening, especially younger when I was sixteen and seventeen. I’d play games with my friends till the middle of the night and just have music on the whole time, so I think all these hours of listening finally caught up to me.”",
      image:
        "https://cdn-resources.ableton.com/resources/filer_thumbnails/press/323_tennyson4.jpg__800.0x400.0_q85_subsampling-2.jpg",
      tags: [
        "Automation",
        "Sound Design",
        "Arpeggiator",
        "Corpus",
        "Delay",
        "EQ Eight",
        "Live 11",
      ],
    },
  ];

  for (const i of Array(97)) {
    const id = nanoid();
    const title = faker.lorem.sentence();
    const description = faker.lorem.paragraph();
    const category = getRandomFromArr(arrOfCategories);
    const content = faker.lorem.paragraphs(10);
    const image = faker.image.image();
    const tags = ArrOfTags.sort(() => Math.random() - 0.5).slice(0, 3);

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
await fsp.writeFile("./script/articles.json", [articles]);
console.log("articles.json created");

function getRandomFromArr(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}
