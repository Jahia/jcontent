---
"@jahia/jcontent": patch
---

A content sample can no longer be published by mistake. Publication already skipped the samples branch when it walked into it, but a publish aimed straight at one sample - from the API, a script or a scheduled publication - went through; samples are now marked as never going live, so publication skips them whichever node it is handed.
