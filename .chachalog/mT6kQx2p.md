---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": patch
---

Fixed the content editor so every mixin in a chain of mixins that extend one another shows its fields when chosen.

Where several such mixins are each offered as a separate choice, only the most derived one showed any fields: picking any of the others showed nothing to fill in, and the choice was lost on save.
