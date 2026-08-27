---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": minor
---

Fixed visibility conditions no longer being evaluated after the migration ran: uninstalling the legacy visibility module removed the condition rules jContent had just registered for the same node types, so content that a condition should have hidden was rendered unconditionally. The migration now also skips entirely when there is nothing to migrate. (#2724)
