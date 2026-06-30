# @jahia/jcontent Changelog

## 3.7.0

### New Features

* Update permission scripts to ensure jContentAccordions is added to right nodes (#2291)

* Exclude read-only fields from saved content during edits to prevent permission issues when saving. (#2322)

* Prevent NPE when reordering hav menu items (#2419)

* Translate panels are now part of advanced editor (#2372)

* Add visibility conditions UI using react and moonstone (#2287)

* Use content type name to indicate inserted content in page builder when area is not a content list (#2321)

* Optimize page builder (#2183)

* Added a GraphQL API for content history (#2269)

* Preview refactor: unified context builder and preview components in JContent and Content Editor, side panel consolidation, enhanced preview zoom functionality (#2402)

* Show insertion points for all children, adjust position to show above headers (#2349)

* Fixed `addMixin` choicelist property so it correctly applies mixins that have no visible fields when saving content. (#2281)

* Prevent invisible create buttons from becoming visible (#2352)

* Update sanitizer policy to allow links in tooltips (#2288)

* Show error if no item is found in the picker field when node is edited. (#2418)

* Fix redirection issue in page builder when system name contains . (#2279)

* Adjust warning label position on save button in content editor (#2454)

* Allow to create named children in list and structured views, take into consideration restrictions of placeholders set at the jsp level when generating create actions (#2417)

* Isolated JContent styles in Page Builder (the EditFrame) from client page styles. (#2259)

* Fixed an issue where the New Folder dialog was hidden behind other modal dialogs (#2453)

* Update z-index on dialog to prevent collision with ck editor (#2264)

* Add missing i18n label for j:bindedComponent in Content Editor (#2275)

* Improve file upload, fix issue with replace functionality (#2431)

* Update how nodetypes are calculated for insertion points to prevent conflicting button types (#2389)

* Added support for custom node-type resolution in form generation via the new `NodeTypeResolver` interface. This allows external modules to control which mixins are considered active and how type membership is evaluated, decoupling form structure from the current state of a JCR node. Enables use cases like generating forms for historical node snapshots without modifying the live node data.

* Correctly resolve insertion point buttons. Make sure that all available types are taken into account. (#2313)

* Add secured options for yarn commands in CI (#2348)

* Fix content creation when no selector options are available (#2470)

* Created a new GQL endpoint to handle effective search of users/groups for jContent pickers. Replaces the inefficient SQL2 query.

* Improve checkbox choicelist selector and make sure it can be used with a choicelist field (#2422)

* Make sure bindable components can be selected in page builder when empty (#2330)

* Adds a collapsible side panel to the Content Editor with two new tabs: **Content Details** and **Content History**.

  * **Content Details** shows publication status, metadata, content links, and technical information. The full content type is now split into three sections: content type, inherited mixins, and applied mixins.
  * **Content History** lists all changes made to a node (create, edit, publish, move, delete) with author, date, and target property. Supports filtering by action type and pagination. Access requires the `viewHistoryTab` permission.

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

* Remove assets static resource usage.

* Disabled create another checkbox in CE if child node limit is reached.

* Allow import of jmix:droppable content.

* Bundle/Package resolution for display template (#2371)
