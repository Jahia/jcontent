[![CircleCI](https://circleci.com/gh/Jahia/jcontent/tree/master.svg?style=svg)](https://circleci.com/gh/Jahia/jcontent/tree/master)
![GitHub tag (latest by version)](https://img.shields.io/github/v/tag/Jahia/jContent?sort=semver)
![License](https://img.shields.io/github/license/jahia/jcontent)

<a href="https://www.jahia.com/">
    <img src="https://www.jahia.com/modules/jahiacom-templates/images/jahia-3x.png" alt="Jahia logo" title="Jahia" align="right" height="60" />
</a>

# jContent

jContent for Jahia. This module provides the main authoring UI for Jahia.

## Getting Started

Note, please, the project is using resources (mainly @jahia/* packages), which have not yet been made available on public repositories. If you encounter any issues with the build, please, contact us at Jahia and we will take care of it.

Compile and deploy the module using:

    mvn clean install
    
By default the module compiles all the Javascript in production mode. If you want to compile in development mode 
(Javascript is not compressed) you can use the "dev" Maven
profile as in the following example:

    mvn clean install -P dev 

## Recompiling only React Javascript

    yarn build

## Watching React Javascript changes

    yarn watch

## Development notes

### Architecture overview

The application is packaged using Webpack and is composed of the following main blocks:

    - ReactJS, https://reactjs.org
    - Redux, https://redux.js.org
    - React Material, https://material-ui.com
    - Apollo GraphQL client, https://www.apollographql.com
    - i18next (for internationalization support), https://www.i18next.com
    
### Redux

The application uses Redux to manage state, and synchronizes the state with the URL so that some parts of the state
are bookmarkeable.
        
### Main view routing

The main route contains the site key and the language of the content as well as the mode in which we are (pages, search,
apps) which is parsed in `JContent.redux.js`. The routing is done in the `ContentRoute` component.

## Reusable federation modules

jContent exposes the following module-federation entries (see `webpack.config.js`):

| Entry                 | Content                                                        |
|-----------------------|----------------------------------------------------------------|
| `./init`              | jContent's own bootstrap, loaded by the app shell               |
| `.`                   | Shared barrel (tables, pickers, Content Editor contexts, utils) |
| `./JContent/actions`  | jContent action definitions                                     |
| `./ContentSidePanel`  | Standalone content side panel — see below                       |

### `./ContentSidePanel`

The content side panel (preview / details / usages / history) rendered for a single node,
outside of jContent's routes. `src/javascript/ContentSidePanel/` fabricates everything the
tabs read, so the host does not have to reproduce jContent's route or redux state.

Props:

| Prop         | Type                        | Description                                                                                                            |
|--------------|-----------------------------|------------------------------------------------------------------------------------------------------------------------|
| `path`       | `string`                    | JCR path of the node. Ignored when `uuid` is set (the panel resolves the path to a uuid with one extra GraphQL query).   |
| `uuid`       | `string`                    | JCR uuid of the node. Takes precedence over `path`.                                                                     |
| `language`   | `string` (required)         | Content language, e.g. `en`.                                                                                            |
| `workspace`  | `'edit'` \| `'live'`        | Workspace the **preview** renders from. Defaults to `edit`. Details / usages / history always read the edit workspace.  |
| `initialTab` | `string`                    | `preview` \| `details` \| `usages` \| `history`, or a raw registry key. Falls back to the first visible tab when the requested one is not displayable. |

The panel fills 100% of its parent, so the host must give it a sized box.

Consuming it from another module (React host rendered inside the app shell — the nominal case):

```js
// webpack.config.js of the consumer — no need to share jContent's heavy dependencies,
// they are satisfied by jContent's own share-scope entries
remotes: {'@jahia/jcontent': 'appShell.remotes.jcontent'}
```

```jsx
import {ContentSidePanel} from '@jahia/jcontent/ContentSidePanel';

<div style={{width: 420, height: '100%'}}>
    <ContentSidePanel path="/sites/digitall/home" language="en" initialTab="details"/>
</div>
```

Loading it dynamically through the federation runtime, with absence detection (older
jContent releases do not expose the entry — `container.get()` rejects):

```js
const container = window.appShell?.remotes?.jcontent;
let ContentSidePanel = null;
try {
    ContentSidePanel = (await container.get('./ContentSidePanel'))().ContentSidePanel;
} catch (e) {
    // Not available in this jContent version — hide the feature
}
```

For non-React hosts, the same entry exports `mountContentSidePanel(element, props)`, which
mounts its own React root and returns an unmount callback.

What the component provides internally:

- the `SidePanelContext` the tabs read (node data, details, technical info, preview capability,
  language, derived jContent mode), built from the Content Editor form definition — the same data
  `JContentSidePanelContextProvider` builds from the jContent routes;
- the `ContentEditorConfigContext` required by `useEditFormDefinition`;
- the side panel tab registrations, when jContent's `./init` bootstrap has not run;
- Apollo client, redux store and notification provider **only when the host tree lacks them**
  (mounting outside the app shell React tree). Inside the app shell the panel shares the host's
  Apollo cache, store and notification queue.

Route-bound behaviour that is deliberately dropped: the full-screen toggle, the close button, the
multi-selection view and jContent's refetch bus — all of them need jContent's own layout and redux
state, and the corresponding callbacks are simply absent from the fabricated context, which hides
those controls.

## Open-Source

This is an Open-Source module, you can find more details about Open-Source @ Jahia [in this repository](https://github.com/Jahia/open-source).

