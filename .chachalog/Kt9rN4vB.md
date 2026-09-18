---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": patch
---

The image picker now only offers images a browser can actually display. Formats such as TIFF or PSD, which the repository counts as images but no browser renders, are no longer listed or searchable there, so an image field cannot be pointed at one and end up as a broken image on the page.
