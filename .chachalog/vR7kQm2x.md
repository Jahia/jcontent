---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": minor
---

Changed the visibility conditions upgrade: jContent now owns the date, time and day-of-week conditions, and removes the modules that provided them. If your environment has the `visibility` or `advanced-visibility` module installed, upgrading jContent uninstalls it on every cluster node, and no separate migration module is needed. Your existing visibility conditions keep working and need no edit. After the upgrade, check that neither module is listed in Administration, Modules. Do not reinstall either one: it would take ownership of the condition types back from jContent. (#2724)
