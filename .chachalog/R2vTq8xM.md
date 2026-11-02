---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": patch
---

Copying a URL or a value to the clipboard now works on a Jahia reached over plain HTTP. The browser only offers its clipboard API over HTTPS or on localhost, so the Copy URL button of the Download dialog used to fail there while still announcing that the URL had been copied, and the copy buttons of the side panel's details tab did nothing at all. Both now fall back to the older copy mechanism, and the Download dialog only confirms a copy that took place.
