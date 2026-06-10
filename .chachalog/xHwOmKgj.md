---
"@jahia/jcontent": minor
---

Adds a collapsible side panel to the Content Editor with two new tabs: **Content Details** and **Content History**.

- **Content Details** shows publication status, metadata, content links, and technical information. The full content type is now split into three sections: content type, inherited mixins, and applied mixins.
- **Content History** lists all changes made to a node (create, edit, publish, move, delete) with author, date, and target property. Supports filtering by action type and pagination. Access requires the `viewHistoryTab` permission.
