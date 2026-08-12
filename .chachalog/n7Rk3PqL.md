---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": patch
---

Fixed Start and End Date visibility conditions so saved times no longer shift across timezones, and clearing a date is no longer silently ignored. Saving is now blocked for date time conditions if left empty. (#2674)
