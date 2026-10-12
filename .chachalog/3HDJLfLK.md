---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": minor
---

Fixed page edits so they no longer fail, or reorder sub-pages, when the editor lacks write access to one of the sub-pages. The ordering list now locks a sub-page that the editor cannot move, and counts the sub-pages that the editor cannot see. (#2795)
