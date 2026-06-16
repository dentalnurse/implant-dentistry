# DNT Implant Dentistry for Dental Nurses

A self-contained, static e-learning site for the *Implant Dentistry for Dental Nurses* course. Built with plain HTML, CSS and JavaScript — no build step, no backend — so it can be hosted directly on GitHub Pages.

## Structure

```
index.html        Landing page (course overview)
portal.html        Course dashboard — module list, progress, final assessment
module.html         Dynamic module page (?m=1 .. ?m=10): content + module quiz
final.html        Final assessment (unlocks once all 10 modules are passed)
css/main.css        Shared styling (teal theme, Nunito Sans)
js/content.js     Generated — all 10 modules' content + combined glossary
js/questions.js  Generated — full question bank (250 module Qs + 40 final Qs)
js/gate.js          Site-wide 4-digit PIN gate
js/app.js            Progress tracking, shared helpers
js/quiz-engine.js Shared quiz rendering logic
js/module.js        Module page logic
js/portal.js        Portal page logic
js/final.js          Final assessment logic
```

## Password gate

Every page is protected by a 4-digit PIN gate (`js/gate.js`). The PIN is checked client-side and, once correct, stored in the browser's `localStorage` so the learner isn't asked again on every page.

**Default access code: `2468`**

To change it, edit the `COURSE_PIN` constant at the top of `js/gate.js`:

```js
const COURSE_PIN = '2468';
```

Visitors can clear their unlocked state at any time using the "Lock site" button in the header.

> Note: this is a client-side gate suitable for keeping a course preview off general search/traffic, not a substitute for real authentication. Anyone with the PIN (or who inspects the page source) can see the course content.

## Course structure

- 10 modules, each with learning objectives, structured content sections, and a glossary.
- Each module has a quiz drawn from a bank of 25 questions; 15 random questions are served per attempt, with a 75% pass mark required to unlock the next module.
- A final assessment draws 20 random questions from a 40-question bank, covering all 10 modules, also requiring 75% to pass.
- Progress (module completion, best scores, attempts) is stored in `localStorage` per browser.

## Regenerating content/question data

`js/content.js` and `js/questions.js` are generated from the source course documents (not included in this repo for content licensing reasons) into JSON, then serialized into JS files prefixed with `const MODULE_CONTENT = ...`, `const COMBINED_GLOSSARY = ...` and `const QUESTION_BANK = ...`. If the source documents change, regenerate these two files and replace them — no other code changes are required as long as the JSON shape stays the same:

```js
// content.js shape
MODULE_CONTENT = [
  { num, title, intro, objectives: [...], sections: [{ heading, paragraphs: [...], list?: [...], closing?: [...] }], glossary: [[term, definition], ...] },
  ...
];
COMBINED_GLOSSARY = [[term, definition], ...];

// questions.js shape
QUESTION_BANK = {
  modules: { "1": { title, questions: [{ q, options: {A,B,C,D}, correct, rationale }, ...] }, ... "10": {...} },
  final: [{ q, options: {A,B,C,D}, correct, rationale }, ...]
};
```

## Local preview

No build tooling is required. From this directory:

```
python3 -m http.server 8080
```

Then open `http://localhost:8080/`.

## Deployment

This site is designed to be served as-is via GitHub Pages from the repository's development branch.
