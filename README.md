# Photo Heist 🔐

A private, playful challenge website: she completes missions (upload proof, quiz, real-world challenges, a vault code) and the photos are revealed gradually. Pure HTML/CSS/JS, no backend, works on GitHub Pages.

## Customize
Everything lives in `config.js`. You never need to edit `script.js`.
- **Names / title:** `herName`, `myName`, `missionTitle`.
- **Photos:** copy your files into `assets/images/` and list them in `photos` (`src` + `caption`). `revealFirst` sets how many open after the vault; the rest unlock after the final challenge. Use compressed JPGs (under ~400 KB each) so it loads fast on mobile.
- **Quiz:** edit `quiz`. `options` are the choices, `answers` are the option texts counted as correct (several allowed). `quizFragment` is the digit she gets at the end.
- **Challenges:** edit `challenges`. Each has a `title`, `text`, the `code` YOU send her after she does it, and a `fragment` she earns.
- **Access codes:** the vault code is all fragments joined in order (quizFragment + each challenge fragment), e.g. `7` + `3` + `1` = `731`. Or set `vaultCode` yourself. The final challenge code is `finalChallenge.code`. Codes ignore case, spaces and dashes.
- **Final message:** `finalMessage`.
- **Sounds (optional):** drop mp3 files into `assets/audio/` using the names in `sounds`. Sound is off until she taps 🔊. Missing files are ignored.

## Publish on GitHub Pages
1. Create a repository and upload all files (keep the folder structure).
2. Settings → Pages → Source: "Deploy from a branch" → `main` / root → Save.
3. Open the link GitHub gives you (`https://username.github.io/repo/`).

## Reset progress
Tap ⚙️ (top right) → RESET MISSION. Or clear the site's data in the browser.

## ⚠️ Not real security
This is a game, not authentication. All codes and photo paths sit in client-side JavaScript, and anyone who opens the page source or dev tools can find them. Don't put anything truly private here, and use a private-ish repo name.

## Receiving the photos (Extraction step)
After the vault, she selects her photos and they are sent to you. Two options:
1. **Cloudinary (recommended, free):** create an account, copy your *cloud name*, then Settings → Upload → Add upload preset → Signing mode **Unsigned**. Put both in `config.js` under `upload`. Photos appear in your Cloudinary Media Library. Free plans have a per-image size limit (around 10 MB, check Cloudinary's current limits).
2. **No setup:** leave `upload` empty. On phones that support it, she gets the share sheet and picks WhatsApp/Telegram to send the photos to you.

The cloud name and preset are visible in the page source, so anyone who finds the page could upload to your account. Keep the repo link private.
