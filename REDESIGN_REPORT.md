# Website redesign report

## Completed

- Replaced the previous design with white backgrounds, dark text, a blue brand
  accent, straightforward navigation, real C4C photos and consistent buttons.
- Built eight pages: Home, About, Our Work, Impact, Get Involved, Contact,
  Winter Youth Business Fair and the past Youth Business Workshops and Fair.
- Centralized the approved 696 school supplies and approximately 100 students,
  program details, pricing, links, team data and contact information.
- Added a dated impact-project structure, project pages, timeline, reports,
  financial-record links and publication controls without sample public records.
- Used the confirmed Saturday 5 PM Pacific schedule. The $70/$119 early-bird
  display expires after September 14, 2026, including restored/cached tabs.
- Kept donation and registration on the official Zeffy forms. The approved
  contact form prepares an email draft; it does not send or store messages.
- Added page metadata, social image, favicon, sitemap, accessible labels and
  focus states, clean routes, old-page redirects and a missing-page screen.
- Removed the old loaders, transition delays and font downloads. The largest
  new photo variants are roughly 100-264 KB instead of 5.5-6.9 MB originals.
- Kept payment handling external and used a restrictive content security policy.
  This is not a penetration test or a claim that the site cannot be hacked.

## Content Needed

These remain unpublished until approved information is supplied:

- Founder story and current leadership names, roles, bios and photos.
- Dated impact timeline and individual project records with location, counts,
  photos, approved partner names and any supporting documents.
- Specific project locations for Where We Work, completed-program totals,
  impact reports and financial records.
- Volunteer opportunities, partnership opportunities and any other programs.
- Verified STEM and entrepreneurship photos, current Winter YBF banner and any
  approved past-event banner. Existing distribution photos are not relabeled
  as unrelated program photography; the YBF panel uses the real C4C logo.

## Needs Confirmation

- The owner confirmed 5 PM Pacific. The Zeffy listing still showed 4 PM during
  review and needs a separate correction in Zeffy.
- Standard registration prices have not been supplied. After early bird ends,
  the website points visitors to Zeffy for current registration options.

## Broken / Missing

- No broken local links or missing referenced assets were found. Original
  photos remain in the repository, and five legacy HTML routes redirect.
- The contact form requires the visitor's email app. There is no delivery
  backend or inbox integration, as approved by the owner.
- Unconfirmed old copy, names and numbers were intentionally not migrated.

## Verification

- Six automated tests passed, including the real browser script's price cutoff.
- Static checks passed for 14 HTML files, local targets, metadata, forms, image
  dimensions and structured-data security hashes.
- Forty browser checks passed: eight pages at 320, 390, 768, 1024 and 1440 pixels.
  No horizontal overflow or broken loaded images; Donate remains visible.
- Tested mobile menu opening, route selection, Escape and focus restoration;
  keyboard focus, mobile timeline, photo loading and legacy redirects.
- Tested empty/invalid form submissions, correctly encoded email drafts and
  clearing a stale draft when the message changes. No test email was sent.
- Browser console checks returned no warnings or errors during the final pass.
- Measured contrast: primary button 6.76:1, body text 14.26:1 and muted text on
  white 6.41:1. This is a focused accessibility check, not a full certification.
- Verified the public Instagram profile and the current Zeffy donation and
  registration destinations. No payments or registrations were submitted.
