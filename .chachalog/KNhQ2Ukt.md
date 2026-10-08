---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": minor
---

Changed the user and group search of the pickers so it is available to users with jContent access to the site being edited.

Custom code that calls the `userSearch` or `groupSearch` fields of the jContent GraphQL API is affected. Pass the key of the site in `siteKey`; without one, the search runs for the system site. Each result is a user or group summary with its name, display name, first and last name, site and provider. To read anything else about a user or group, query its node by path or identifier.
