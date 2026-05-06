---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": patch
---

Visibility tab is now correctly gated by `viewVisibilityTab` instead of `viewSeoTab`; existing roles that had `viewSeoTab` are auto-granted `viewVisibilityTab` via a startup patch so they keep their access (#2289)
