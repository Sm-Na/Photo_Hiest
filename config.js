// ✏️ Edit everything here. You never need to touch script.js.
const CONFIG = {
  herName: "Siva",
  myName: "Ma7ame7o",
  missionTitle: "PHOTO HEIST",
  difficulty: 80,          // % shown on the landing screen
  accessLevel: 87,         // % shown in the vault

  // Mission 02: "answers" = the option text(s) counted as correct
  quiz: [
    { question: "What is my favorite food?", options: ["Pizza", "Rice, Molokhia and chicken", "Sushi"], answers: ["Rice, Molokhia and chicken"] },
    { question: "Which month is my birthday?", options: ["January", "April", "November"], answers: ["April"] },
    { question: "ايه اكتر وقت بحبه معاكي؟", options: ["لما بمسك ايدك", "كل وقت", "لما بحب فيكي"], answers: ["كل وقت"] },
    { question: "Which drink would I pick?", options: ["Tea", "Coffee", "Juice"], answers: ["Tea", "Coffee"] }
  ],
  quizFragment: "7",       // shown after the quiz

  // Mission 03: you give her each code manually once she completes the task.
  // Each verified challenge gives her one fragment. The vault code is all
  // fragments joined in order (quizFragment + challenge fragments), e.g. "7319".
  challenges: [
    { title: "Voice note", text: "Send me a 10-second voice note saying why I deserve these photos.", code: "m7ame7o", fragment: "3" },
    { title: "Funny face", text: "Send a screenshot of your funniest selfie face.", code: "loves", fragment: "1" },
    { title: "Last words", text: "Send me one sentence that describes us.", code: "siva", fragment: "9" }
  ],
  vaultHint: "Your Birthday is important, and mine too",  // clue shown on the vault screen
  vaultCode: "206204",     // private vault code (when set, fragments show as 🔑 icons instead of digits)

  // Photos SHE uploads to you (Mission "Extraction")
  photoCount: 12,          // number shown in the vault ("photos available")
  // Free setup: cloudinary.com -> Settings -> Upload -> add an UNSIGNED upload preset.
  // Leave empty to use the phone's share sheet instead (she picks WhatsApp/Telegram -> you).
  upload: { cloudName: "zurdlndr", preset: "sameh_gallery", folder: "photo-heist" },

  // Optional reveal gallery of photos YOU already have. Leave [] to skip it.
  revealFirst: 6,
  photos: [],              // e.g. { src: "assets/images/photo01.jpg", caption: "Memory #01" }

  finalChallenge: { text: "One last effort: describe our worst inside joke in one sentence and send it to me.", code: "omega" },

  finalMessage: "Okay, fair enough. You made me work for these too. 😂❤️",

  messages: {
    right: ["Correct. 👀", "Okay... you actually know me.", "Access level increased."],
    wrong: ["Nice try. 😂", "That was suspiciously confident.", "I expected better."]
  },

  // Optional sound files. Missing files are ignored silently.
  sounds: {
    click: "assets/audio/click.mp3", scan: "assets/audio/scan.mp3", wrong: "assets/audio/wrong.mp3",
    right: "assets/audio/correct.mp3", unlock: "assets/audio/unlock.mp3", complete: "assets/audio/complete.mp3"
  }
};
