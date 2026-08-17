---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": minor
---

Fixed Visibility condition start/end datetime property so they no longer change when viewing saved values (#2653). All date/time fields are now saved in UTC and also now display datetime based on browser timezone. Clearing a visibility date property also now removes it instead of silently keeping the old value.
