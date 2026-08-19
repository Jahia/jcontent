# jContent extension points

This document lists the extension points jContent exposes to other Jahia modules, and how to plug
into them.

Everything here is done through the registry from `@jahia/ui-extender`. You never import from
jContent itself, so your module only needs `@jahia/ui-extender` (and `@jahia/moonstone` for icons) as
a peer dependency, and does not have to be rebuilt when jContent is.

---

## Language row actions (`content-editor/field/all-languages/row-actions`)

### What it is

The content editor's field 3-dots menu has an **Edit in all languages** entry, which opens a modal
listing one row per site language for a single field. Every row already has a *copy from source
language* icon button on its right. This extension point lets your module add its own button next to
it, per row.

The typical use case is AI-assisted translation: "fill this row by translating the source language's
value".

### How the slot behaves

| Actions registered on the target | What the user sees |
|---|---|
| 0 | Nothing - the row layout is unchanged |
| 1 | Your button, as a plain icon button next to the copy icon |
| 2 or more | A 3-dots menu holding all of them, so the row never outgrows the reserved space |

You don't have to do anything to handle the collapse - it happens automatically, and your action
receives exactly the same props either way.

### Registering an action

Register it from your module's `jahiaApp-init` callback, like any other action:

```jsx
import React, {useState} from 'react';
import {registry} from '@jahia/ui-extender';
import {Loader, Robot} from '@jahia/moonstone';

export default function () {
    registry.add('callback', 'myTranslationModule', {
        targets: ['jahiaApp-init:2'],
        callback: () => {
            registry.add('action', 'aiTranslateField', {
                targets: ['content-editor/field/all-languages/row-actions:1'],
                buttonIcon: <Robot/>,
                buttonLabel: 'myModule:label.aiTranslate',
                component: AiTranslateFieldAction
            });
        }
    });
}
```

And the action component itself:

```jsx
const AiTranslateFieldAction = ({render: Render, hasSourceValue, isReadOnly, isSourceLanguage,
                                 language, sourceLanguage, field, getSourceValue, onSetValue,
                                 ...otherProps}) => {
    const [isBusy, setBusy] = useState(false);

    const translate = async () => {
        setBusy(true);
        try {
            onSetValue(await myTranslationService(getSourceValue(), sourceLanguage, language));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Render {...otherProps}
                isVisible={!isSourceLanguage && hasSourceValue}
                enabled={!isReadOnly && !isBusy}
                buttonIcon={isBusy ? <Loader size="small"/> : <Robot/>}
                onClick={translate}/>
    );
};
```

That's the whole contract: decide `isVisible` / `enabled`, and call `onSetValue` when clicked.

### Props your action receives

| Prop | Type | What it is |
|---|---|---|
| `field` | object | The field being edited, as defined by the content editor form (`name`, `propertyName`, `displayName`, `multiple`, `mandatory`, `selectorType`, ...) |
| `language` | string | Language code of **this** row - the one you write to |
| `sourceLanguage` | string | Language code of the source row (the first one, the language the editor was opened in) |
| `isSourceLanguage` | boolean | Whether this row *is* the source row |
| `isReadOnly` | boolean | The row cannot be edited: node is locked, or the user has no write permission in that language |
| `hasSourceValue` | boolean | Whether the source row currently holds a value. Reactive - safe to use in `isVisible` / `enabled` |
| `nodeUuid` | string | UUID of the node being edited |
| `editorContext` | object | The underlying content editor context (`nodeData`, `siteInfo`, `lang`, ...) |
| `getValue()` | function | Returns this row's current value |
| `getSourceValue()` | function | Returns the source row's current value |
| `onSetValue(value)` | function | Writes a value into this row |

Plus the standard action props (`render`, `buttonIcon`, `buttonLabel`, ...).

### Value shapes

`getValue()`, `getSourceValue()` and `onSetValue()` all speak the field's *form* value, not the raw
JCR value. What that is depends on the field:

- a single-valued text field: a string
- a `multiple` field: an array of strings
- a checkbox: a boolean
- a date picker: an ISO date string

Read with `getSourceValue()` and write back the same shape. jContent takes care of converting it to
the right JCR property when the user saves.

### Rules worth knowing

**Values are read through getters, not passed as props.** The slot sits outside each row's own Formik
provider, so `useFormikContext()` will not work there, and mirroring live values into props would
re-render every row on every keystroke. Call `getValue()` / `getSourceValue()` from your click
handler. For anything reactive - hiding or disabling your button - use `hasSourceValue`.

**`onSetValue` does not persist anything.** It fills the row in the form, exactly as if the user had
typed the value. It is written to the repository together with all the other rows when the user hits
**Save**, and discarded if they hit **Cancel**. This is deliberate: it keeps whatever your action
produced reviewable and undoable, which matters a lot for machine-generated content.

**You own your pending state.** jContent does not manage a busy state for you. If your action calls a
remote service, keep a local `isBusy` and reflect it yourself (swap the icon for a `Loader`, set
`enabled={false}`), as in the example above.

**Your button is rendered on every row, including the source row and read-only rows.** That is on
purpose - only you know whether your action makes sense there. Use `isSourceLanguage` and
`isReadOnly` to decide. A translation action typically hides itself on the source row
(`isVisible={!isSourceLanguage}`) and disables itself on read-only rows.

### Reference

The props above are declared and commented on `LanguageRowActions.propTypes`, in
[`src/javascript/ContentEditor/actions/contenteditor/editFieldAllLanguages/LanguageRowActions.jsx`](src/javascript/ContentEditor/actions/contenteditor/editFieldAllLanguages/LanguageRowActions.jsx).
