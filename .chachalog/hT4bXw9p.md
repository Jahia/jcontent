---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": patch
---

Stop selecting the deprecated `createVersion` field in the file upload and file replace mutations. JCR versions of uploaded files are no longer created by the GraphQL provider — version history is now handled by the content-versioning module.
