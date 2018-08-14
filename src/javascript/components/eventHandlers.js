import {GetNodeByPathQuery} from "./gqlQueries";

// Event handlers use a context provided when registering events in listenersRegistry

const eventHandlers = {
    // listeners after save button in engines.
    updateButtonItemEventHandlers: [(context, path, nodeName) => window.parent.updateContentManagerStore(context, path, nodeName)]
}

window.parent.updateContentManagerStore = (context, enginePath, engineNodeName) => {
    const path = enginePath.substring(0, enginePath.lastIndexOf('/') + 1) + engineNodeName;
    // check if enginePath is equal to the path of the router (this means that we are editing the tree selection)
    // then check if the path has changed
    if (enginePath === context.path && enginePath !== path) {
        context.goto(path, context.params);
    } else {
        context.apolloClient.query({
            query: GetNodeByPathQuery,
            fetchPolicy: "network-only",
            variables: {"path": path, "language": context.language, "displayLanguage": context.uiLang}
        });
    }
}

export default eventHandlers;