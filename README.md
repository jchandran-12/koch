# 🎂 Birthday Site

A single scrolling Quarto page made as a birthday surprise.

## Sections

1. **Hero**: portrait, Malayalam greeting, name that rises in, drifting gold dust
2. **Intro**: a note that types itself out
3. **By the Numbers**: counters from her birth date (hidden until `data-birthdate` is set)
4. **The Many Sides of Koch**: six photo "chapters"
5. **Snapshots**: masonry gallery with lightbox
6. **Koch & Chettan**: photos of the two of us
7. **Six Things I Love About You**: flip cards
8. **Letter**: an envelope that opens
9. **Wishes**: messages from family (commented out until filled in)
10. **Make a Wish**: candles to blow out

## Editing

| What                      | Where                                 |
|---------------------------|---------------------------------------|
| Names                     | `_variables.yml`                      |
| Birth date (for counters) | `data-birthdate` in `index.qmd`       |
| All text & photos         | `index.qmd` (look for ✏️)              |
| Colours & fonts           | top of `styles/birthday.scss`         |
| Animations / interactions | `assets/js/birthday.js`               |
| Background music          | add `assets/music/song.mp3` (a 🎵 button appears automatically) |

## Preview locally

Install [Quarto](https://quarto.org/docs/get-started/), then:

```bash
quarto preview
```

## Publish on GitHub Pages

1. Push to `main`.
2. On GitHub, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Each push to `main` re-renders and deploys the site to `https://<user>.github.io/<repo>/`.
