---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": minor
---

Added support for custom node-type resolution in form generation via the new `NodeTypeResolver` interface. This allows external modules to control which mixins are considered active and how type membership is evaluated, decoupling form structure from the current state of a JCR node. Enables use cases like generating forms for historical node snapshots without modifying the live node data. The `org.jahia.modules.contenteditor.api.forms` and `org.jahia.modules.contenteditor.api.forms.model` packages are exported so external modules can consume the interface and the form model.