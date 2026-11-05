---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": minor
---

Added the `contentEditor.contentTypeSelectorPane` extension point, so a module can show a pane beside the content type tree, for example a preview of the selected type, and create the node itself. Also exposed `Preview` and `buildPreviewContextsFromNode`, so such a pane renders a node the way the side panel does.
