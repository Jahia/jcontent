import {GetNodeAndChildrenByPathQuery} from "./gqlQueries";

// Event handlers use a context provided when registering events in listenersRegistry

const eventHandlers = {
    // listeners after save button in engines.
    updateButtonItemEventHandlers: [(context, path, nodeName, uuid) => CmEventHandlersFunctions.onContentSave(context, path, nodeName, uuid, false)],
    createButtonItemEventHandlers: [(context, path, nodeName, uuid) => CmEventHandlersFunctions.onContentSave(context, path, nodeName, uuid, true)]
};
const CmEventHandlersFunctions = {
    onContentSave: function (context, enginePath, engineNodeName, uuid, forceRefresh) {
        // clean up the cache entry
        const path = enginePath.substring(0, enginePath.lastIndexOf("/") + 1) + engineNodeName;
        if (enginePath === context.path && enginePath !== path) {
            context.goto(path, context.params);
        } else {
            // update the parent node to update the current node data (needed for add / remove / move etc ..
            // TODO: do not call forceCMUpdate() but let the application update by itself ( BACKLOG-8369 )
            context.apolloClient.query({
                query: GetNodeAndChildrenByPathQuery,
                fetchPolicy: "network-only",
                variables: {
                    "path": path.substring(0, path.lastIndexOf("/")),
                    "language": context.language,
                    "displayLanguage": context.uiLang
                }
            }).then(forceRefresh && window.forceCMUpdate());
        }
    }
};
export default eventHandlers;