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
    name: "Srujana",
    nickname: "Jaanu",
    birthday: "October 21",
  },
  from: "Harsh",

  music: {
    /** Put an mp3 in /public/music/ and set e.g. "/music/song.mp3". Leave empty for a soft generated ambient pad. */
    src: "",
    label: "Sound",
  },

  intro: {
    lines: ["Every fairytale begins somewhere.",
      "Yours begins here."],
    whisper: "A TALE UNLIKE ANY OTHER",
    cta: "Enter your little universe",
  },

beginning: {
  eyebrow: "Chapter I — A little wonder",
  title: ["How can someone", "be this wonderful?"],
  body: "The way you laugh, the little things you notice, the warmth you bring without even trying. It's almost unfair how effortlessly you make ordinary things feel special. If magic ever took the shape of a person, I think it would look a little like you Jaanu.",
  photos: [
    { src: "/photos/photo-7.jpg", alt: "Laughing in the golden light", caption: "that smile of yours", aspect: 3 / 4, rotate: -4, depth: 0.6 },
    { src: "/photos/photo-8.jpg", alt: "Warm lights under the evening sky", caption: "You're pure magic", aspect: 4 / 5, rotate: 5, depth: 1 },
    { src: "/photos/photo-2.jpg", alt: "Walking by the sea at dusk", caption: "beautiful without even trying", aspect: 4 / 3, rotate: -2, depth: 0.3 },
  ] as Photo[],
  cta: "There's more to you",
},

memories: {
  eyebrow: "Chapter II — Little moments",
  title: "Somehow, the little things felt like magic.",
  items: [
    { photo: { src: "/photos/photo-6.jpg", alt: "Seaside road at sunset", aspect: 4 / 3, rotate: -3, depth: 0.5 } as Photo, text: "Some moments don't need to be extraordinary. Somehow, with you, even the simplest ones felt different." },
    { photo: { src: "/photos/photo-5.jpg", alt: "Coffee at night", aspect: 4 / 5, rotate: 4, depth: 0.8 } as Photo, text: "The kind of conversations that made time disappear, and left me wishing it would slow down." },
    { photo: { src: "/photos/photo-4.jpg", alt: "Smiling by the window", aspect: 3 / 4, rotate: -5, depth: 0.4 } as Photo, text: "And that smile... one of those little things that could make an ordinary day feel beautiful." },
  ],
  cta: "There's more I want you to see",
},

appreciation: {
  eyebrow: "Chapter III — If only you knew how beautiful you are, Jaanu",
  messages: [
    "Sometimes, I look into your eyes and feel like there's so much more to them than words could ever explain.",
    "There's something rare about the way you make being yourself look so effortlessly beautiful.",
    "You have your own kind of magic — in the way you care, the way you think, and the way you see the world.",
    "Even on the days you doubt yourself, I hope you know there's so much about you worth admiring.",
    "If you could see yourself through my eyes, even for a moment, you'd understand just how wonderful you really are.",
  ],
  nextLine: "One more thing...",
  cta: "There's still more",
},

turning: {
  eyebrow: "Chapter IV — A moment just for you",
  lines: [
    "Of all the things this world could have created,",
    "somehow, it created you.",
    "And I don't think you realise",
    "just how extraordinary that is.",
    "So, for a moment,",
    "let's put the whole world aside",
    "and now, all eyes on you."
  ],
  cta: "Let it begin",
},

  reveal: {
    pre: "Today, the world celebrates",
    you: "YOU",
    headline: ["HAPPY", "BIRTHDAY"],
    photos: [
      { src: "/photos/photo-3.jpg", alt: "Birthday cake with a candle", caption: "make it count", aspect: 5 / 4, rotate: -3, depth: 0.5 },
      { src: "/photos/photo-1.jpg", alt: "You, glowing", caption: "the guest of honour", aspect: 3 / 4, rotate: 4, depth: 0.8 },
    ] as Photo[],
    wishButton: "Make a wish & blow the candle",
    afterWish: "Wish sealed. May every single bit of it come true.",
    cta: "There's a letter for you",
  },

  letter: {
    eyebrow: "Chapter V — A letter",
    openHint: "Tap the envelope to open",
    greeting: "Dear Jaanu,",
    paragraphs: [
      "Happy birthday, Jaanu ❤️ Aaj ka din tumhare liye hai, aur I really hope ki tumhara aane wala saal bahut khoobsurat ho. Tum jitna khud ko samajhti ho na, tum usse kahin zyada achhi ho. Tumhari chhoti chhoti baatein, tumhara nature, aur tumhara apne tareeke se har cheez ko dekhna — there's just something about you that's so special. I hope tum aise hi raho, aur tumhare paas hamesha aise reasons hon jo tumhe dil se smile karayein. Bas tum khush raho, apne mann ki karo (thode time pe mere be sun liya karo), aur kabhi khud ko kam mat samajhna.",
      "Pata hai Jaanu, kabhi kabhi purani baatein yaad aati hain toh mann karta hai ki kaash kuch moments thodi der aur ruk jaate. Woh chhoti chhoti conversations, bina kisi reason ke hasna, aur bas tumhara aas-paas hona — us waqt shayad realise nahi hota tha ki ye sab itna yaad aayega. Aaj bhi kabhi koi chhoti si cheez tumhari yaad dila deti hai, aur phir bas mann karta hai tumse baat karun, tumhare saath thoda aur waqt bitaun. Main shayad kabhi theek se bata nahi paaya ki tum mere liye kitni important ho, but tumhari jagah meri life mein hamesha special rahegi.",
      "Aur lastly, thank you Jaanu, meri life mein aane ke liye aur itni saari yaadein dene ke liye. Jo bhi humne saath share kiya, woh mere liye aaj bhi bahut precious hai, aur main us sab ke liye dil se grateful hoon. Pata nahi aage life humein kahan le jaayegi, but somewhere in my heart, I still hope ki humare liye kuch beautiful moments baaki hai. Ki kabhi phir saath baith sake, chhoti chhoti baaton pe has sakein, aur bina kisi jaldi ke ek doosre ke saath waqt bita sake. Main nahi jaanta kab ya kaise, aur na hi main tumse koi promise chahta hoon. Bas itna hai ki kabhi na kabhi humare raaste dobara ek ho jaayenge. Tab tak, ki leye bhout sara kaam hain aur dil mein be bhout kuch hai. ",
      "Tum meri zindagi ka woh ehsaas ho Jaanu, jise lafzon mein bayaan karna mushkil hai, waqt se mitaana namumkin, aur dil se juda karna shayad kabhi mumkin hi nahi. ❤️",
    ],
    signoff: "Always in your corner,",
    signature: "Harsh",
    cta: "One last thing",
  },

  finale: {
    lines: ["Happy birthday, once again.", "Thank you for your presence."],
    photo: { src: "/photos/photo-9.jpg", alt: "A final portrait", caption: "JAANU", aspect: 3 / 4, rotate: -2, depth: 0.3 } as Photo,
    restart: "Watch it again from the beginning",
  },
};

export type Story = typeof story;
