---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": patch
---

Changed file upload so files are no longer versioned at upload time. Files are still versioned when they are published, so only the extra version taken during the upload is affected. Upload-time versioning was already removed in the GraphQL provider 3.9.0, so nothing changes for installations running that version or later.
