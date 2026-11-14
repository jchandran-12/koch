# Images

| Folder      | Used in                          | Tip |
|-------------|----------------------------------|-----|
| `hero/`     | Round portrait on the opening screen | `portrait.jpg`, any square-ish photo with her face near the top |
| `chapters/` | "The Many Sides of Koch"         | Portrait shots, cropped to 4:5 |
| `gallery/`  | "Snapshots" masonry grid         | Any shape, shown uncropped |
| `us/`       | "Koch & Chettan" + the letter    | First photo is shown wide (4:3), the rest 3:4 |

To add a photo, drop it into the right folder and add a block in `index.qmd`, e.g.

```
::: {.g-item .reveal}
![Your caption](images/gallery/new-photo.jpg){.lightbox group="gallery"}
:::
```

Keep files under ~600 KB each (about 1500–2000 px on the long side) so the page loads fast on phones.
