# Crayons for Change

Static HTML served by GitHub Pages at https://crayons4change.org.

## Editing

`data/content.json` is the source of truth for statistics, program dates, prices,
links, contact information, team members, and publication status. Do not edit
generated HTML directly. `scripts/build.mjs` renders all pages with Node 20+;
it has no runtime dependencies. Run `npm run build` and `npm run check` before
committing both the data/source edits and generated pages.

`assets/site.css` is the shared visual system. `assets/site.js` only handles the
mobile menu, temporary price visibility and the email draft form. Content and
navigation work without JavaScript. No loading screen or animation delays.

`npm run dev` serves the preview on port 4173. Photo optimization is optional for
ordinary builds; `scripts/images.cjs` uses Sharp to regenerate existing WebP
variants from the original photos. Install Sharp locally when changing photos.
The originals are retained in Git, but no page downloads them.

## Approved content only

CONTENT NEEDED - DO NOT GENERATE PLACEHOLDER COPY.

- Empty story and leadership arrays are not rendered.
- Impact timelines, projects, reports and financial records are rendered only
  when an entry has `published: true`. Projects must have title, date, location,
  category, summary and a real cover photo with alt text.
- Volunteer and partnership opportunities are hidden until approved records
  have been supplied and marked published.
- `impact.locations` is intentionally empty pending project-level confirmation.
- Team records support name, role, bio, image and published.
- Timeline records support date, title, description and published.
- Report/financial records support title, url and published.
- Involvement records support title, description, url, linkLabel and published.
- `data/project.schema.json` describes all future project fields. Add records
  under `impact.projects`; their individual pages are generated automatically.
- New content images need `src`, `alt`, `width` and `height`. Use the actual
  image dimensions. Unpublishing a project removes its generated page on build.
- The three existing photos show supply distribution. They must not be labelled
  as STEM camp or entrepreneurship photography.

## Registration

Winter YBF registration and all donations go directly to the official Zeffy
forms. No checkout is hosted here. Pricing appears only on the Winter YBF page.
It is hidden by default in HTML and enabled by a Pacific-date check, so it stays
hidden after September 14, 2026 even in cached pages. Without JavaScript, only
the current registration link appears. Standard prices remain empty.

The owner confirmed Saturday classes at **5 PM Pacific Time**. Zeffy still showed
a **4 PM** start during the September 14 review. Correct the Zeffy event separately.

## Contact form

The owner approved an email-draft form. It validates the four fields, prepares a
mailto link and allows the visitor to review and send it in their email app.
It does not send or store messages, and does not report successful delivery.
Direct email and Instagram links are available without JavaScript.

## Publication

GitHub Pages publishes the checked-in static output from `main`. Clean directory
routes and old `.html` redirects are included. The CNAME stays crayons4change.org.
Verify the named `abhim65` API identity before a push; never change global Git
credentials or VMUNC settings. After publishing, verify Pages reports the new
commit as built and that the live domain serves the same generated files.
