---
# Allowed version bumps: patch, minor, major
"@jahia/jcontent": minor
---

Replace Content Editor's date and time pickers with Moonstone's `DateTimeInput`, `TimeInput` and `TimezoneSelector`. Date-time values are stored as UTC instants; the timezone selector of visibility conditions only changes how the value is displayed.
