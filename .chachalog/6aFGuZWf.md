---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": minor 
---

Fixed the visibility migration script to ensure that module uninstallation is performed on all cluster nodes. Install the `visibility-migrator` module prior to upgrading jContent if `visibility` module is present in the environment. (#2726)
