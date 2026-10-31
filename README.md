# WPulse Hub

A plain website made of simple files: four pages that share one stylesheet and one script. No installing, no building. Edit the files, upload them, done.

The live site is at **https://wpulsegaming.runs-at.dev/**

## What is in this folder

| File / folder | What it is |
|---|---|
| `index.html` | Home: the intro, the Next duel card (countdown and calendar buttons), Commentary, the "Fair and proctored" note. |
| `stream.html` | The **Broadcast** page: About the stream, How a match works, Where to watch, On screen, the Telestrator. |
| `faq.html` | The **FAQ** page. |
| `players.html` | **For players**: apply, fair play and rules, install the extension (the download), update, match-day setup. |
| `styles.css` | Colours and layout for all four pages. Colours are at the very top. |
| `script.js` | The small script all pages share (copy buttons, scroll effects, the "On this page" highlight, the phone menu, opening the right FAQ or rules answer from a link). |
| `images/` | Screenshots, logos, commentator photos and the next duel flyer. |
| `downloads/` | The extension zip, `wpulse-extension.zip`. |
| `favicon.ico` | The browser tab icon. |

Don't rename the files: links, redirects and link previews use these names. The names in the header are not the file names (`stream.html` is shown as "Broadcast"). Folders whose names start with `_backup` are local copies; don't upload them.

## Opening it on your computer

Double-click `index.html`. Links between the pages work the same way, because they are relative.

## How to edit the text

1. Open the page in any text editor (Notepad, VS Code).
2. Search for `TODO` (Ctrl+F) in each page. Placeholders and things still to do are marked this way.
3. Each section starts with a comment box like `SECTION 3: PLAYER SETUP` so you can find it quickly.
4. Save, then double-click `index.html` to check it in your browser.

Things you will change most often:

- **Next duel** (`index.html`): edit the card in the "Next duel & schedule" section (players, date and time, format). The countdown, local time and calendar buttons come from the script at the bottom of the page, which has these constants: `DUEL_START_ISO` (the start time, in UTC), `DUEL_TITLE`, `DURATION_HOURS`, and `HUB_URL` and `YOUTUBE_URL` (used in the calendar text). Change the date text in the card to match `DUEL_START_ISO`, and the calendar file name `wpulse-duel-2026-11-07.ics` in the same script. When the players are announced, follow the `REVEAL` comment in the card.
- **Flyer**: save it as `images/next-duel-flyer.png`. It is shown next to the Next duel card and is also the image in link previews (`og:image` and `twitter:image` on every page).
- **Stream link**: the page links to the YouTube channel. When a specific live stream URL is available, search `index.html` for `TODO: replace the channel link` and replace the channel link at each of those places.
- **Extension version and date** (`players.html`): one line under the download button in "Install the extension" (search `Version:`). The zip is `downloads/wpulse-extension.zip`.
- **Contact details**: the footer on every page has the email, the Discord handle (the copy button uses its `data-copy` value) and the YouTube link. `players.html` also shows the email and Discord handle in the "Apply to play" card and in the "Send your install ID" step.
- **Credits**: in the footer, the `<details class="ft-credits">` block holds the contributor names. If you add or remove a name, update the number in "Credits (7)".
- **FAQ** (`faq.html`): copy a `<details>...</details>` block to add a question.

## Parts that repeat on every page

The **header**, the **footer** and the **icon sprite** (the hidden `<svg>` block at the top of each page) exist in all four pages. If you change one of them, make the same change in every page.

These are different on each page: the `<title>`, the description, the `og:` and `twitter:` tags (including `og:url`), and the "On this page" sidebar (`nav.toc`).

## Old links

`index.html` and `players.html` each have a small script at the top (in `<head>`) that sends old `#section` links, from when everything was one page, to the right new page. Please don't remove it.

## Adding screenshots

1. Save the image in `images/` (for example `images/step-1.png`). Use 16:9 shaped screenshots.
2. Where you want it, add:

```html
<img class="shot" src="images/step-1.png" width="1280" height="720" alt="What the screenshot shows">
```

Keep the `width` and `height` so the layout does not jump.

## Adding the extension download

Put your zip in `downloads/` and name it exactly `wpulse-extension.zip`. The download button already points to it. Update the version and date text when you replace it.

## Publishing

Upload **all** the files you changed together: the pages, `styles.css`, `script.js`, and anything in `images/` or `downloads/`. Keep the same folder layout as here. Then hard-refresh the site (Ctrl+F5) so the browser doesn't show old files.

## Rules to keep in mind

- This site is **public**. Never put passwords, private links, camera/stream links meant for players only, or admin details in these files.
- Keep links relative (for example `images/step-1.png` or `players.html#proctor`, never starting with `/`), so the pages also work when you open them from your computer.
