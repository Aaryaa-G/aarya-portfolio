# Aarya Gojare Portfolio

Static, no-build multi-page portfolio site for GitHub Pages. Open `index.html` locally, choose a side, or publish the repository root as a GitHub Pages source.

## Edit content

Shared personal content lives in `shared/data.js`: identity, links, education, skills, missions, orbit milestones, achievements and modal copy. The engineering portfolio is `space.html`, and the creative works are in `gallery.html`.

The shared navigation and sound preference live in `shared/nav.js`, with shared layout styles in `shared/base.css`. Replace `"[URL]"` with real LinkedIn/GitHub URLs and add the downloadable resume at `assets/Aarya-Gojare-Resume.pdf`.

Add personal photos and SSTV images under `assets/`, then replace the placeholder blocks in `index.html` / `script.js`. The current placeholders intentionally avoid exposing a phone number.

## Deploy

Push the repository root to GitHub. In **Settings → Pages**, choose **Deploy from a branch**, select the default branch and `/ (root)`, then save.
