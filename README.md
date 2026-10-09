# Happy Birthday MANITA ❤️

A small, hand-built birthday website: a scroll-through story with playful interactive moments, a photo gallery, a mini-game, and a few surprises along the way.

Built with plain **HTML, CSS and JavaScript**. No frameworks, no build step, no dependencies.

## Highlights

- Cinematic intro with a particle-lit hero and a step-by-step reveal
- Scroll-driven story scenes, a love meter and animated "research" stats
- Interactive moments: a birthday cake celebration, a playful "important question", a constellation of reasons, and more
- Photo gallery with captions and a swipe-friendly lightbox
- A small catch-the-hearts mini-game (mouse, keyboard and touch)
- An animated "Happy Birthday" welcome with a typing line, on the second page
- Warm burgundy, rose and gold design system built on CSS variables

## Project structure

```
vishii-birthday/
├── index.html        Main page
├── manita.html       A second, more personal page
├── css/
│   ├── style.css       Design system and all component styles
│   ├── animations.css  Shared keyframes and motion helpers
│   └── responsive.css  Breakpoints and touch-device tweaks
├── js/
│   ├── main.js         Interactions and page logic
│   ├── animations.js   Scroll reveals, counters, story, constellation
│   ├── effects.js      Particles, custom cursor, sparkles
│   ├── gallery.js      Photo gallery and lightbox
│   └── game.js         Mini-game
└── assets/
    └── images/         Your photos (photo-01.jpg, photo-02.jpg, ...)
```

## Run it

Open `index.html` in a browser, or serve the folder locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Customising

- **Photos:** drop square (1:1) images into `assets/images/` and edit the list at the top of `js/gallery.js` (file paths and captions). Missing photos show a friendly placeholder.
- **Colours and fonts:** change the variables at the top of `css/style.css`.
- **Text:** most copy lives directly in the HTML files.

## Performance and compatibility

- Responsive from small phones to large desktops, in portrait and landscape
- Tuned for Safari and iOS: safe-area insets, stable viewport units, no layout-shifting toolbar resizes
- Animations stick to `transform` and `opacity` where possible, and pause while off-screen
- Respects `prefers-reduced-motion` with calm, static fallbacks
- Works offline when photos are stored locally

## Made with love

Made for MANITA. 🎂✨
