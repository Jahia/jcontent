import * as _ from "lodash";
import {getNodeByPath} from "./gqlQueries";

class GWTExternalEventsHandlers {

    constructor(client) {

        this.listeners = {
            // listeners after save button in engines.
            updateButtonItemEventHandlers: [(path, nodeName) => window.parent.updateContentManagerStore(path, nodeName)]
        }

        window.parent.updateContentManagerStore = (enginePath, engineNodeName) => {
            const path = enginePath.substring(0, enginePath.lastIndexOf('/') + 1) + engineNodeName;
            // check if enginePath is equal to the path of the router (this mean that we are editing the tree selection)
            // then check if the path has changed ..
            if (enginePath === this.path && enginePath !== path) {
                this.goto(path, this.params);
            } else {
                client.query({query: getNodeByPath, variables: {"path": path, "language": this.language, "displayLanguage": this.language}});
            }
        }

        // register listeners
        _.mergeWith(window.parent, this.listeners);
    }

    setContext(path, goto, params, language, refresh) {
        this.path = path;
        this.goto = goto;
        this.params = params;
        this.language = language;
        this.refresh = refresh;
    }
}

// register method to reset store


export default GWTExternalEventsHandlers;