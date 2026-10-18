/**
 * ─────────────────────────────────────────────────────────────
 *  THE STORY FILE — edit everything personal here.
 *  Photos live in /public/photos/ and are referenced as "/photos/name.jpg".
 * ─────────────────────────────────────────────────────────────
 */

export type Photo = {
  src: string;
  alt: string;
  caption?: string;
  /** width / height, e.g. 3/4 for portrait */
  aspect?: number;
  /** degrees of tilt */
  rotate?: number;
  /** parallax depth: 0 = still, 1 = strong drift */
  depth?: number;
};

export const story = {
  recipient: {
    name: "Aanya",
    nickname: "little star",
    birthday: "October 17",
  },
  from: "Harsh",

  music: {
    /** Put an mp3 in /public/music/ and set e.g. "/music/song.mp3". Leave empty for a soft generated ambient pad. */
    src: "",
    label: "Sound",
  },

  intro: {
    lines: ["Some people arrive quietly.", "And somehow, they change everything."],
    whisper: "A small film, made for one person",
    cta: "Enter your little universe",
  },

  beginning: {
    eyebrow: "Chapter I — The beginning",
    title: ["This is a story", "about you."],
    body: "About the way you laugh before the joke is finished. The way you notice what everyone else misses. The way rooms feel warmer simply because you walked in.",
    photos: [
      { src: "/photos/photo-1.jpg", alt: "Laughing in the golden light", caption: "that laugh, frame one", aspect: 3 / 4, rotate: -4, depth: 0.6 },
      { src: "/photos/photo-3.jpg", alt: "Two coffees under string lights", caption: "late conversations", aspect: 4 / 5, rotate: 5, depth: 1 },
      { src: "/photos/photo-2.jpg", alt: "Walking by the sea at dusk", caption: "roads with no hurry", aspect: 4 / 3, rotate: -2, depth: 0.3 },
    ] as Photo[],
    cta: "Remember with me",
  },

  memories: {
    eyebrow: "Chapter II — Little moments",
    title: "The small things became the big things.",
    items: [
      { photo: { src: "/photos/photo-2.jpg", alt: "Seaside road at sunset", aspect: 4 / 3, rotate: -3, depth: 0.5 } as Photo, text: "That evening we walked until the sky ran out of colour — and kept walking anyway." },
      { photo: { src: "/photos/photo-3.jpg", alt: "Coffee at night", aspect: 4 / 5, rotate: 4, depth: 0.8 } as Photo, text: "Two coffees gone cold, because the conversation was warmer." },
      { photo: { src: "/photos/photo-1.jpg", alt: "Smiling by the window", aspect: 3 / 4, rotate: -5, depth: 0.4 } as Photo, text: "The kind of afternoon light I'll always associate with you." },
    ],
    cta: "There's something I want to say",
  },

  appreciation: {
    eyebrow: "Chapter III — Things I never say enough",
    messages: [
      "You are kind in ways nobody asks you to be.",
      "You make ordinary days feel like they were worth remembering.",
      "You carry other people's worries as if they were your own — and never ask for credit.",
      "You are brave, even on the days you don't feel it.",
      "And I am grateful, quietly and constantly, that you exist.",
    ],
    nextLine: "Next thought",
    cta: "Stay a moment",
  },

  turning: {
    eyebrow: "Chapter IV — A pause",
    lines: [
      "If the world had a list of rare things,",
      "you would be near the very top.",
      "So today, it should stop for a moment —",
      "and look at you.",
    ],
    cta: "Let it begin",
  },

  reveal: {
    pre: "Today, the world celebrates",
    you: "YOU",
    headline: ["HAPPY", "BIRTHDAY"],
    photos: [
      { src: "/photos/photo-4.jpg", alt: "Birthday cake with a candle", caption: "make it count", aspect: 5 / 4, rotate: -3, depth: 0.5 },
      { src: "/photos/photo-1.jpg", alt: "You, glowing", caption: "the guest of honour", aspect: 3 / 4, rotate: 4, depth: 0.8 },
    ] as Photo[],
    wishButton: "Make a wish & blow the candle",
    afterWish: "Wish sealed. May every single bit of it come true.",
    cta: "There's a letter for you",
  },

  letter: {
    eyebrow: "Chapter V — A letter",
    openHint: "Tap the envelope to open",
    greeting: "Dear Aanya,",
    paragraphs: [
      "Another year of you — and the world is luckier for it. I hope this one is gentle with you, and generous. I hope it brings you mornings that start slowly and evenings that end with laughter.",
      "I hope you chase the things that make your heart race, and rest without guilt when you need to. I hope you know how deeply you are loved, even on days when it's quiet.",
      "Thank you for every memory, every conversation, every ordinary moment you turned into something worth keeping.",
    ],
    signoff: "Always in your corner,",
    signature: "Harsh",
    cta: "One last thing",
  },

  finale: {
    lines: ["Happy birthday, once again.", "Thank you for being you."],
    photo: { src: "/photos/photo-1.jpg", alt: "A final portrait", caption: "17 · 10", aspect: 3 / 4, rotate: -2, depth: 0.3 } as Photo,
    restart: "Watch it again from the beginning",
  },
};

export type Story = typeof story;
