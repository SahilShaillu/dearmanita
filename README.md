# Happy Birthday, MANITA ❤️

A cinematic, interactive birthday website built as a personal gift.
It's a fully static site — no backend, no build tools, no internet
connection required after you download it.

The site is now **two pages**:

- **`index.html`** — the main public experience. Anyone with the link
  can open this one.
- **`manita.html`** — a private, password-gated page with the more
  personal sections (the CEO/Princess bits, the survival guide, the
  pampering menu, the heartbeat section, the private love letter, and
  the final celebration). The whole page is locked behind a secret
  code until it's entered correctly — see section 4 below. `index.html`
  links to it from a "there's one more thing" button near the end.

Like the letter password before it, this is a **front-end romantic
touch, not real security** — the code lives in plain JavaScript
(`js/private-gate.js`), so anyone who opens the browser's dev tools
could find it. It's there to make opening it feel like a little
treasure hunt, not to actually protect sensitive information.

---

## 1. Running it locally

**Easiest way:** just double-click `index.html` and it will open in
your browser. Everything (fonts, styles, scripts) is self-contained
and works offline.

**If your browser blocks local file access** for a feature (some
browsers restrict things when opening files directly with the
`file://` protocol), run a tiny local server instead from this folder:

```bash
python -m http.server
```

Then open `http://localhost:8000` in your browser. No installation
required beyond Python, which most computers already have. This is
completely optional — the site is built to work by simply opening
`index.html`.

---

## 2. Adding her photos

You have two options for `src`, and you can mix both in the same array:

**Option A — local files (keeps the site fully offline):**
1. Add your **square (1:1) images** to `assets/images/`.
2. Name them `photo-01.jpg`, `photo-02.jpg`, etc. — or use your own names.

**Option B — image URLs (no files to manage, but needs internet to view):**
Just use a full image link as `src` instead of a local path — for example
`https://example.com/photos/her-smile.jpg`. This is handy if your photos
are already hosted somewhere. The trade-off: visitors need an internet
connection to see them, and the link needs to keep working — if it ever
breaks or expires, that slot shows the placeholder card instead, exactly
like a missing local file would.

Open `js/gallery.js` and edit the `galleryImages` array near the
top of the file:

```javascript
const galleryImages = [
  { src: "assets/images/photo-01.jpg", caption: "My favourite smile ❤️" },
  { src: "https://example.com/photos/her-smile.jpg", caption: "Beautiful as always 💗" },
  // add, remove, or reorder entries freely — local paths and URLs can be mixed
];
```

If an image is missing or fails to load, the gallery automatically shows an
elegant placeholder card instead of a broken-image icon — so the site
always looks intentional, even before you've added every photo.

---

## 3. Editing the private love letter

The letter now lives on `manita.html` (the private page). Open that
file and find the section with `id="letterPaper"` (search for
`letter__paper`). Each paragraph is a `<p>` tag — edit the text
directly. There's no separate password for the letter itself anymore
— opening it just requires having already unlocked the private page
(see section 3b below), so a second code right after the first would
have been redundant.

---

## 3b. Changing the private page's secret code

`manita.html` is locked behind a 4-digit code until it's entered
correctly. That code lives in `js/private-gate.js`:

```javascript
const GATE_CODE = "0520";
```

Change this constant to whatever code you'd like. As with the old
letter password, this is a **front-end romantic surprise only** — the
code technically lives in the JavaScript file (anyone who opens dev
tools could find it), but it isn't shown anywhere in the visible
interface. It's not real security, just a sweet little gate to make
opening it feel special.

---

## 4. Customizing colors and fonts

All colors and fonts are defined as CSS variables at the very top of
`css/style.css`, inside `:root { ... }`:

```css
--wine: #3D0B14;
--burgundy: #6B1E2E;
--rose: #C97B87;
--gold: #C6A15B;
--font-display: Georgia, ...;
```

Change any value there and it updates throughout the entire site. The
typefaces intentionally use refined system font stacks (Georgia-based
serif for headings, a script stack for accents, system sans-serif for
body copy) so the whole experience renders identically and instantly
offline on any device, with no font files to download.

---

## 5. Editing birthday details / text content

Almost all the text lives directly in `index.html`, organized by
section with clear HTML comments (`<!-- 1. CINEMATIC INTRO -->`,
`<!-- 13. MINI GAME -->`, etc.). Search for the text you want to
change and edit it in place.

The birthday date shown in the hero and timeline sections is written
as plain text (`13 • 10 • 2003`) rather than calculated — update it
directly wherever it appears if needed.

---

## 6. The mini-game: "Save the Birthday Hearts"

Located in `js/game.js`. You can tweak:
- `GOOD` / `BAD` arrays — the falling items and their point values/messages
- `spawnInterval`, difficulty scaling — search for `level` and `spawnInterval`
- The hidden birthday code `13102003` — typed anywhere on the game
  section unlocks a small celebration message (separate from the
  love-letter password).

---

## 7. Deployment (optional)

This is a fully static site, so it can be hosted for free on any of
these (no backend required):

- **GitHub Pages** — push this folder to a repo, enable Pages in
  repo settings, pointing at the root or `main` branch.
- **Netlify** — drag and drop this folder into Netlify's dashboard.
- **Vercel** — `vercel deploy` from inside this folder, or drag-and-drop
  via the dashboard.
- **Cloudflare Pages** — connect a repo or direct-upload the folder.

Because every asset uses relative paths (`css/style.css`,
`assets/images/...`), the site will work correctly whether it's opened
locally or hosted at any URL path.

---

## 8. Project structure

```
vishii-birthday/
├── index.html      → public page
├── manita.html     → private, password-gated page
├── css/
│   ├── style.css        → design tokens + layout for every section
│   ├── animations.css    → keyframe animations
│   └── responsive.css    → breakpoint adjustments
├── js/
│   ├── main.js            → shared interactions: letter, finale, easter eggs, avatar
│   ├── animations.js      → scroll reveals, love meter, story scroll
│   ├── gallery.js          → photo gallery + lightbox
│   ├── game.js              → the mini-game
│   ├── effects.js           → particles, custom cursor, confetti
│   └── private-gate.js       → manita.html's page-level password lock only
├── assets/
│   ├── images/    → put photos here
│   ├── icons/
│   ├── fonts/     → (not required — see note below)
│   └── audio/     → optional, unused by default
├── README.md
└── LICENSE.txt
```

Both pages load the same CSS and most of the same JS files — each
script only acts on the elements that actually exist on the current
page, so it's safe for `main.js`, `animations.js`, `gallery.js`, and
`game.js` to be loaded on both without anything breaking.
`private-gate.js` is the one exception and is only loaded on
`manita.html`.

**A note on fonts:** rather than bundling external font files, this
project uses carefully chosen system font stacks that render
beautifully out of the box on Windows, macOS, iOS, and Android — with
zero download size and guaranteed offline reliability. If you'd like
to swap in a custom webfont later, drop the font files into
`assets/fonts/` and reference them with an `@font-face` rule at the
top of `css/style.css`.

---

## 9. Accessibility & performance notes

- Respects `prefers-reduced-motion` throughout.
- All interactive elements (cards, stars, gallery, modals, game) work
  with keyboard and touch — nothing depends on hover alone.
- Modals trap focus sensibly and close on `Esc`.
- Particle counts and animation complexity automatically scale down
  on lower-powered devices.

Enjoy, and happy birthday to her. ❤️
