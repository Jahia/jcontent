---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": patch
---

Show every field a mixin carries when several mixins that extend the same type also extend one another and each is its own choicelist target. Only the most derived one kept a fieldset, so choosing any of the others showed no fields at all and the mixin was dropped on save (#2746)
