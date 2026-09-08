---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": patch
---

Always send a field a list of the values it may take, empty where there is nothing to choose from, and let every selector cope with its absence. A field with no choicelist behind it was sent no list at all, which the editor read without checking (#2746)
