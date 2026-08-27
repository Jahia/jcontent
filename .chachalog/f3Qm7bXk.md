---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": patch
---

Content Editor opens again on Jahia 8.2.1.0 to 8.2.3.x, where its GraphQL types failed to register at all because the content history adapter refused to initialise on a core without the 8.2.4.0 methods.
