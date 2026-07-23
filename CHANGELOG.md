# @jahia/jcontent Changelog

## 3.7.0

### New Features

* Update permission scripts to ensure jContentAccordions is added to right nodes (#2291)

* Fixed an issue that prevented jmix:nolive content from being deleted (#2567)

* Keep accordion panel scrollbar visible on hover in Chrome (#2563)

* Exclude read-only fields from saved content during edits to prevent permission issues when saving. (#2322)

* Add a button group dropdown for the *Live* button that lets users select which domain to open the live URL in, based on the domains configured on the site (j:serverName and j:serverNameAliases). The selected domain is saved in localStorage and used by default when clicking the *Live* button. (#2522)

* Make document search on file name case-insensitive (#2558)

* Prevent NPE when reordering hav menu items (#2419)

* Exclude ";" from system name (#2552)

* Exposed `<EditPanelContent>` and date formatting primitives to UI extensions. (#2527)

  These objects are avaible through `import { EditPanelContent, dateFormatter } from "@jahia/jcontent"` in the module federation.

* Translate panels are now part of advanced editor (#2372)

* Add visibility conditions UI using react and moonstone (#2287)

* Apply the height set in a textarea field definition (textarea\[height='...']) instead of ignoring it (#2437)

* Use content type name to indicate inserted content in page builder when area is not a content list (#2321)

* Optimize page builder (#2183)

* Added a GraphQL API for content history (#2269)

* Preview refactor: unified context builder and preview components in JContent and Content Editor, side panel consolidation, enhanced preview zoom functionality (#2402)

* Added new `tableConfig` options for accordion items - `contextualMenu` to override the right-click menu, `header.showStatus` to hide the publication-status badge, and `columns` to control which table columns are shown. (#2491)

* Show insertion points for all children, adjust position to show above headers (#2349)

* Fixed `addMixin` choicelist property so it correctly applies mixins that have no visible fields when saving content. (#2281)

* Prevent invisible create buttons from becoming visible (#2352)

* Added a table showing usages to the sidebar of jContent and Content Editor.

* Fix issue where Content Editor fields are missing intermittently when using template mixins with inherited mixins (#2467)

* Update sanitizer policy to allow links in tooltips (#2288)

* Copy language dialog now always displays available source languages  (#2606)

* Show error if no item is found in the picker field when node is edited. (#2418)

* Add export/import actions to content tree menu (#2553)

* Fix redirection issue in page builder when system name contains . (#2279)

* Adjust warning label position on save button in content editor (#2454)

* Allow to create named children in list and structured views, take into consideration restrictions of placeholders set at the jsp level when generating create actions (#2417)

* Isolated JContent styles in Page Builder (the EditFrame) from client page styles. (#2259)

* Remove the Advanced Options tab from the Content Editor

  * Technical information and usages are now available in the CE side panel
  * GWT Workflow and role engine tabs are now available from the advanced section in Content Editor modes dropdown
  * Legacy GWT versioning also available from the advanced section in Content Editor modes dropdown for Jahia versions < 8.2.4.0

* Fixed an issue where the New Folder dialog was hidden behind other modal dialogs (#2453)

* Update z-index on dialog to prevent collision with ck editor (#2264)

* Added support for custom node-type resolution in form generation via the new `NodeTypeResolver` interface. This allows external modules to control which mixins are considered active and how type membership is evaluated, decoupling form structure from the current state of a JCR node. Enables use cases like generating forms for historical node snapshots without modifying the live node data. The `org.jahia.modules.contenteditor.api.forms` and `org.jahia.modules.contenteditor.api.forms.model` packages are exported so external modules can consume the interface and the form model.

* Improve and update Advanced Search helper texts and documentation links (#2508)

* Show empty content overlay in Page Builder when a bound component has no content to display (#2517)

* Add missing i18n label for j:bindedComponent in Content Editor (#2275)

* Improve file upload, fix issue with replace functionality (#2431)

* Update how nodetypes are calculated for insertion points to prevent conflicting button types (#2389)

* Correctly resolve insertion point buttons. Make sure that all available types are taken into account. (#2313)

* Add secured options for yarn commands in CI (#2348)

* Fixed an issue where special characters in display name were not displayed correctly in the Mark for Deletion dialog. (#2531)

* Fix content creation when no selector options are available (#2470)

* Calculate insertion point only for elements with visible children (#2588)

* Created a new GQL endpoint to handle effective search of users/groups for jContent pickers. Replaces the inefficient SQL2 query.

* Improve checkbox choicelist selector and make sure it can be used with a choicelist field (#2422)

* Adds a collapsible side panel to the Content Editor with two new tabs: **Content Details** and **Content History**.

  * **Content Details** shows publication status, metadata, content links, and technical information. The full content type is now split into three sections: content type, inherited mixins, and applied mixins.
  * **Content History** lists all changes made to a node (create, edit, publish, move, delete) with author, date, and target property. Supports filtering by action type and pagination. Access requires the `viewHistoryTab` permission.

* Add workflows shortcut to modes dropdown in CE (under advanced options).

* Improved context menus so they open immediately with a loading indicator and display available actions faster. (#2363)

### Bug Fixes

* Added url encoding of links coming from link and image picker, to resolve issues with symbols like `+`. Backport of a fix from CK5.

* Fix rendering of absolute areas so they can be edited (#2300)

* Prevent NPE when selected marked for deletion content is removed (#2305)

* Fixed validation of numbers when their range is open-ended.

* Prevent context menu from showing on page target in Page Builder (#2445)

* fix visibilityScreen test by returning false on PublishAndWait if jobs are undefined; Upgrade cypress and jahia/cypress (#2397)

* Fixed custom validation messages for fields with no default value.

* Visibility tab is now correctly gated by `viewVisibilityTab` instead of `viewSeoTab`; existing roles that had `viewSeoTab` are auto-granted `viewVisibilityTab` via a startup patch so they keep their access (#2289)

* Validate node types against the registry before using them in the sub-contents count query

* Exposed a new `ContentEditorFragment` GraphQL fragment for UI extensions to display a Content Editor form. (#2574)

* Ensure visibility purge job correctly stops/restarts on Tomcat restart (#2568)

* Fixed choicelists to use labels in UI language instead of content language.

* Remove assets static resource usage.

* Remove lowercase conversion from uploaded files. (#2564)

* Disabled create another checkbox in CE if child node limit is reached.

* Switching the editing language no longer reloads the content editor

* Dependent fields driven by unsaved changes (internal link page picker, dependent constraints) are kept when switching the editing language

* Allow import of jmix:droppable content.

* Bundle/Package resolution for display template (#2371)

* Addressed a scroll rollback bug when Content Editor is in two-column layout, e.g., translate layout. (#2583)

* Restored technical details in the sidebar (#2519)
