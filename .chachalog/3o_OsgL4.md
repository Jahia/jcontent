---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": minor
---

Add a button group dropdown for the _Live_ button that lets users select which domain to open the live URL in, based on the domains configured on the site (j:serverName and j:serverNameAliases). The selected domain is saved in localStorage and used by default when clicking the _Live_ button. (#2522)
