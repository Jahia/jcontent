---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": patch
---

A file uploaded from inside a picker is only selected if the picker accepts it: uploading a PDF from an image picker no longer leaves it selected with the select button enabled. Uploading an image still selects it, as before. Only uploads made while the picker is open count, so one the upload panel was still showing from earlier work in jContent is no longer picked up as if it had been chosen there.
