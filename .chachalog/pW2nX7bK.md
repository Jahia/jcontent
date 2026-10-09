---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": patch
---

Fixed the content editor GraphQL provider failing to register on Jahia 8.2.1.0 to 8.2.3.x. ModernContentHistoryAdapter resolves two ContentHistoryService methods in a static initializer and threw when they were absent, which surfaced as an ExceptionInInitializerError to anything that merely loaded the class and took down registration of the whole provider. It now leaves the methods unresolved and fails only if one of them is actually called, letting ContentHistoryAdapter fall back to LegacyContentHistoryAdapter as intended
