---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": patch
---

Fixed migrating away from the legacy visibility/advanced-visibility modules so it completes correctly and consistently on every node of a cluster, instead of hanging the install or leaving conditional-visibility rules broken on some nodes.
