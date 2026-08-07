---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": patch
---

Stop selecting the deprecated `createVersion` field in the file upload and file replace mutations. The field is an inert no-op in recent versions of the GraphQL provider and its value was never used.
