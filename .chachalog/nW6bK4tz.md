---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": patch
---

Show a field constraint's error message as written instead of html-escaping its punctuation, so a message from a resource bundle no longer reads "L&#39;entrée est invalide". The same fix applies to the broken-link message, which interpolates a server-supplied link (#2748)
