---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": patch
---

Open the publication manager from the publication dropdown again: the action read the node primary node type without asking the node checks for it, so the click threw instead of opening the dashboard. It also read the mixins from the wrong place, so the manager was always handed an empty mixin list (#2715)
