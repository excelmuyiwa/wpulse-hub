# WPulse Player Hub

A plain website made of simple files. No installing, no building. Edit the files, upload them, done.

## What is in this folder

| File / folder | What it is |
|---|---|
| `index.html` | The whole page. All the text lives here. |
| `styles.css` | Colours and layout. Colours are at the very top. |
| `images/` | Put your screenshots here. |
| `downloads/` | Put the extension zip here. |

## How to edit the text

1. Open `index.html` in any text editor (Notepad, VS Code).
2. Search for `TODO` (Ctrl+F). Every placeholder is marked this way. Replace it with your text.
3. Each section starts with a comment box like `SECTION 3: PLAYER SETUP` so you can find it quickly.
4. Save, then double-click `index.html` to check it in your browser.

Things you will change most often:

- **Stream link**: search for `example.com/TODO-stream-url` and replace it (it appears in several places).
- **Schedule**: in section 2, copy a `<tr>...</tr>` row to add a game, delete one to remove it.
- **Version and date** of the extension: one line in step 1 of Player setup (search `Version:`).
- **FAQ**: copy a `<details>...</details>` block to add a question.

## Adding screenshots

1. Save the image in `images/` (for example `images/step-1.png`). Use 16:9 shaped screenshots.
2. In `index.html`, replace the dashed `<div class="shot-ph">...</div>` box with:

```html
<img class="shot" src="images/step-1.png" width="1280" height="720" alt="What the screenshot shows">
```

## Adding the extension download

Put your zip in `downloads/` and name it exactly `wpulse-extension.zip`. The download button already points to it. Update the version and date text when you replace it.

## Publishing on GitHub Pages

1. Create a GitHub repository named `wpulse-hub`.
2. Upload everything in this folder (`index.html`, `styles.css`, `images`, `downloads`, `README.md`). On github.com you can use **Add file > Upload files**.
3. Go to **Settings > Pages**. Under **Build and deployment**, set Source to **Deploy from a branch**, choose branch `main` and folder `/ (root)`, and Save.
4. After a minute or two the site is live at `https://<your-username>.github.io/wpulse-hub/`.

To update the site later, upload the changed files again (same names) and wait a minute.

## Rules to keep in mind

- This site is **public**. Never put passwords, private links, camera/stream links meant for players only, or admin details in these files.
- Keep links relative (for example `images/step-1.png`, never `/images/step-1.png`), or they will break under `/wpulse-hub/`.
