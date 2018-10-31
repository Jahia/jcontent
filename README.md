# Content & Media Manager

Content & Media Manager Module for Jahia DX. This module provides a backend UI for a headless usage scenario of Jahia
DX.

## Getting Started

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

### Bootstrapping

Currently the bootstrapping is done in the `src/main/resources/jnt_template/html/template.content-manager.jsp` view but 
should be move to an external file.

### Entry point 

The entry point to the React app is in 

    src/javascript/ContentManagerApp.jsx
    
### Redux

The application uses Redux to manage state, and synchronizes the state with the URL so that some parts of the state
are bookmarkeable.
        
### Main view routing

The main route contains the site key and the language of the content as well as the mode in which we are (browse, search,
apps). The routing is done in the `ContentManager` component.
