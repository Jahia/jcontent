# Page Builder design structure
## EditFrame

 Main entry point for page builder that generates main components:

- Boxes overlay
- Infos/status 
  - currently only manages deleted status
- DndOverlays 
- Page-level header insertion point (PageHeaderContainer) e.g. jexp page-level header

### Responsibilities

- Manages the single iframe and the document it holds
  - a navigation (another page, language, template or URL parameters) loads the frame
  - a refresh after a change morphs the new rendering into the current document (`core/morphFrame.js`), so the
    view stays still and nothing flashes. It falls back to a reload, with the view restored by `EditFrame.anchor.js`,
    when the new rendering needs a script or a stylesheet the page has not loaded
  - the overlays are mounted again after each refresh, as for a new document
- Owns the page builder store (`core/pageBuilderStore.js`): the hovered path and the clicked element
- Owns the layout scheduler (`core/layoutScheduler.js`), which re-measures the overlays when the page can have moved
- Connects the frame's window to react-dnd (`core/frameDndBridge.js`)
- Handles content modification events
  - Apollo client cache flush by ID from CE modification events
  - Apollo client cache flush for all content from refresh all event (when calling `triggerRefetchAll()` or with CONTENT_DATA from `JContent.refetches`)

## Core

| Module | Role |
|---|---|
| `pageBuilderStore.js` | Hover and click state outside React state; a box subscribes to the one value it derives (`usePageBuilderState`) |
| `useFrameEvents.js` | The one set of listeners on the frame document. Each event is resolved once to the module it concerns (`resolveTarget`), including through a header, a footer or create buttons |
| `layoutScheduler.js` | Runs the overlay measurements in one animation frame after a resize, a DOM change, a load, a transition end, a scroll or a slow fallback sweep. `useTrackedRect` gives a component its element's rectangle |
| `frameCoords.js` | Converts frame positions to host positions, for menus and popovers |
| `frameDndBridge.js` | Forwards the frame's drag events to the react-dnd HTML5 backend |
| `morphFrame.js` | Refreshes the frame in place; carries the module ids over so that the morph keeps the same elements |

## Boxes

Renders main components

- List of Box elements
- Create buttons (when there is no clicked element) for all elements
- Handles the frame's events through `useFrameEvents`: hover, click and selection, double click, context menu, Escape
- Insertion points (when there is a clicked element) creates multiple create buttons (using Create react component) for a given clicked element
- Context menu handler

### Responsibilities

- Maps current iframe elements in iframe with node information
- Can refetch node information with PAGE_BUILDER_BOXES from JContent.refetches

### Iframe Elements 

- `[jahiatype=”mainmodule”]` - root iframe node (right under body)
- `[jahiatype=”module”]` - iframe components, can be have one of the following `[type]` attributes: area, absoluteArea, list?, existingNode (content in list) or placeholder (create buttons)
  - Create buttons [type=”placeholder”] tracked by placeholder state
  - Everything else is tracked by modules state

### Corresponding Boxes elements

- `[jahiatype=”header”]` and `[jahiatype=”footer”]` - specified within a Box react component
- `[jahiatype=”createbuttons”]` - Specified within Create react component
  - `[data-jahia-id]` - id to the corresponding [type=”placeholder”] create button element from iframe
  - `[data-jahia-parent]` - id to the corresponding component associated with the create button; same attribute as the original [type=”placeholder”] create button in iframe

## Box

- Positions the `Box` over the underlying iframe element (`useTrackedRect`)
- Init and Handle DnD behaviour through useNodeDrop and attach drop handler to the underlying iframe element represented by this box
- Injection and handling of custom box configs using registry.find({type: 'pageBuilderBoxConfig'}) for a given target nodeType
- Rendering of header, footer and breadcrumbs

### Page builder box configuration 

```
{
        Bar - component to render as header replacement,
        isBarAlwaysDisplayed,
        isActionsHidden,
        isStatusHidden,
        isSticky,
        borderColor,
        backgroundColors: { base, hover, selected }
}
```


## Create 

- Renders create buttons for  `[type=”placeholder”]` elements and also `[type=”existingNode”]` as insertion points
- Displays createContent, paste, pasteReference actions and handles reordering of nodes if it is an insertion point
