---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": patch
---

Right-clicking the empty part of the content panel, in pages list view, media or content folders, no longer raises an error in the browser console. The menu it tried to open was removed in an earlier clean-up; only the call to it was left behind.
