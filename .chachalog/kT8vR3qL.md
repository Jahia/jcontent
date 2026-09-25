---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": minor
---

Reworked the category manager around a single panel. Categories move out of jContent into the new Taxonomy navigation area, and the tree that used to sit in the second level of navigation is now one expandable tree in the main panel, loaded branch by branch. Adds a usages column counted after the rows render, drag and drop between categories with a one-level undo, a language switcher in the toolbar, and a scroll-to with a brief highlight for a newly created category (#2793)
