## DatePickerInput

Thin wrapper around moonstone's `DateTimeInput`, mapping Content Editor's field model
(variant, JCR-derived calendar bounds, stored-value timezone) onto its props.

### Variants

-   date: calendar only
-   datetime: calendar + time, no timezone (the general case for a `DateTimePicker` field)
-   zonedDatetime: calendar + time + timezone selector (visibility conditions)

### Props

-   minDate / maxDate: String 'YYYY-MM-DD' — inclusive calendar bounds (whole days, for all variants)
-   lang: String ['en', 'fr', 'de']
-   variant: String ['date', 'datetime', 'zonedDatetime']
-   onBlur: function
-   onChange: function(date: Date | null)
-   initialValue: Date
-   readOnly: Boolean
-   displayDateFormat: string (dayjs tokens, e.g. 'DD/MM/YYYY HH:mm')

### Timezone

There is no `timeZone` prop. The `zonedDatetime` variant's timezone only changes how the value is
displayed: moonstone starts on the browser zone, keeps the zone the author picks while editing,
and does not call `onChange` when it changes. The emitted value is an instant (UTC, no zone), so a
value reopened later is shown in the reader's own browser zone.

### Examples

```jsx
<DatePickerInput lang="en" />
```
