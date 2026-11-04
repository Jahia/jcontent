---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": patch
---

Starting a fresh Jahia no longer logs "No JContent configuration found to update for component visibility." as a warning. The script that emitted it migrates a configuration left over from an earlier version, and a fresh install simply has none to migrate — the configuration the module ships already carries the right values.
