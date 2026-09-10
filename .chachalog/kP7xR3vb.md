---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": patch
---

Show every field a dynamic mixin carries, including one it inherits from a supertype shared with a sibling mixin. Where several mixins extend the same type and inherit the same property, only one of them was showing it and the others silently lost it (#2746)
