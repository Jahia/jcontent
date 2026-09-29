---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": patch
---

Fixed mixin fields so that every mixin shows all fields it carries, including inherited fields. When multiple mixins inherit the same field, the field remains editable in a single place without one value overwriting another. GraphQL now always returns the list of values available for an editor form field, using an empty list when there are no values instead of null. (#2746)
