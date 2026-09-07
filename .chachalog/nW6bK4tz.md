---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": patch
---

Show a field constraint's error message as it was written, instead of with its punctuation as HTML entities — a message from a resource bundle no longer reads "L&#39;entrée est invalide". The message was being html-encoded by the sanitizer that strips markup from it, then rendered as plain text. Two other error messages, the constraint violation reported on save and the broken-link message, were separately being encoded by i18next's interpolation and are fixed too (#2748)
