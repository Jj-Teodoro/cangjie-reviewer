# Cangjie Academy

A self-paced course for the [Cangjie](https://cangjie-lang.cn/en/docs) programming language: 13 lessons, example programs with expected output, per-lesson quizzes and a timed final exam.

Each visitor gets a random seed stored in their browser. Question order, answer order and exam papers are generated from that seed, and every retry deals a new set. Scoring runs in the browser, so this is for practice and not for proctored assessment.

## Run locally

It is a static site with no build step. Serve the folder with any static server:

```bash
npx serve .
```

## Layout

- `index.html`: page shell
- `assets/content.js`: lessons, questions and references
- `assets/app.js`: routing, randomization, quizzes and exam
- `assets/styles.css`: styles
