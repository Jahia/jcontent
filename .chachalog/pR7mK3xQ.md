---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": patch
---

Preview content that has a content template - a node carrying jmix:mainResource, typically stored in the Content branch - through that template instead of rendering only its view, so the preview pane shows the content the way a visitor would see it. A j:view on such a node is no longer forwarded as the template name, which used to leave the preview empty (#2753)
