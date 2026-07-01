---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": minor
---

Export the editor-form API packages (`org.jahia.modules.contenteditor.api.forms` and `org.jahia.modules.contenteditor.api.forms.model`) so external modules can implement the `NodeTypeResolver` extension point (#2479) and generate editor forms through `EditorFormService`. Previously only `graphql.api.forms` was exported, so these types were unreachable across bundles. (#2479)
