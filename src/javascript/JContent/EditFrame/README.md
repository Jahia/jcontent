# Page Builder design structure
## EditFrame

 Main entry point for page builder that generates main components:

- Boxes overlay
- Infos/status 
  - currently only manages deleted status
- DndOverlays 
- Page-level header insertion point (PageHeaderContainer) e.g. jexp page-level header

### Responsibilities

- Manages iframe loading; keeping track of current document between the two iframes
  - iframeSwap is a reference backup of iframe for tracking scroll position and copies it over to current iframe on load
- Keeps track of repositioning/aligning boxes with its associated element through `intervalCallback` by calling these on a set interval 
  - can this be handled with events instead of polling?
- Handles content modification events
  - Apollo client cache flush by ID from CE modification events
  - Apollo client cache flush for all content from refresh all event (when calling `triggerRefetchAll()` or with CONTENT_DATA from `JContent.refetches`)

## Boxes

Renders main components

- List of Box elements
- Create buttons (when there is no clicked element) for all elements
- Clears any clicks outside of Boxes components through LinkInterceptor
- Insertion points (when there is a clicked element) creates multiple create buttons (using Create react component) for a given clicked element
- Context menu handler

### Responsibilities

- Maps current iframe elements in iframe with node information
- Can refetch node information with PAGE_BUILDER_BOXES from JContent.refetches
- Track currentElement with mouse events (mouseover, mouseout)

```
currentElement = {
    moduleElement - iframe component being hovered on, or the parent element if hovering on [type=”placeholder”] create buttons
    Path - path of moduleElement
}
```

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

- Reposition the `Box` component corresponding to the underlying iframe element (triggered by `intervalCallback` from EditFrame)
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
