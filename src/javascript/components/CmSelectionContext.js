import {LoadSelectionQuery} from "./gqlQueries";

class CmSelection {
    constructor(selectedItems) {
        this.items = selectedItems;
    }

    isEmpty() {
        return this.items.length === 0;
    }

    getSelected() {
        return !this.isEmpty() ? this.items[0] : null; 
    }
}

class CmSelectionContext {
    constructor(ctx) {
        this.ctx = ctx;
        this.treeSelection = new CmSelection(ctx.state.selectedTreeItems);
    }
    
    tree() {
        return this.treeSelection;
    }
}

class CmSelectionHelper {
    static addIfHasChanged(dxContext, newState, key, newValue) {
        if (dxContext.state[key] != newValue) {
            newState[key] = newValue;
        }
    }

    static parseRouteData(location, match) {
        let mode = null;
        let relPath = null;
        if (location.pathname.startsWith(match.url) && location.pathname.length > match.url.length + 1) {
            let rest = location.pathname.substring(match.url.length + 1);
            if (rest.length > 1) {
                let pos = rest.indexOf('/');
                if (pos != -1) {
                    mode = rest.substring(0, pos);
                    relPath = rest.substring(pos + 1);
                } else {
                    mode = rest;
                }
            }
        }
        let path = '/sites/' + match.params.siteKey;
        if (relPath !== null) {
            path = path + '/' + relPath;
        }
        
        return {
            'mode': mode,
            'relPath': relPath,
            'path': path
        }
    }

    static updateTreeSelection(dxContext, location, match) {
        let routeData = this.parseRouteData(location, match);

        let oldTreeSelection = dxContext.state.selectedTreeItems;
        let newTreeSelection = null;
        if ((routeData.mode === 'browse' || routeData.mode === 'browse-files') && routeData.relPath !== null) {
            // we are browsing content/pages/files
            if (oldTreeSelection.length === 0 || oldTreeSelection[0].path !== routeData.path) {
                // selection has changed
                newTreeSelection = [routeData.path];
            }
        } else {
            // we clear the selection
            newTreeSelection = oldTreeSelection.length > 0 ? [] : null;
        }

        let updateAnsynchronously = false;
        let newState = {};
        this.addIfHasChanged(dxContext, newState, 'siteKey', match.params.siteKey);
        this.addIfHasChanged(dxContext, newState, 'lang', match.params.lang);
        if (newTreeSelection !== null) {
            if (newTreeSelection.length > 0) {
                this.updateTreeSelectionWithNodes(dxContext, newTreeSelection, newState);
                // we will update the state after the node data will be loaded
                updateAnsynchronously = true;
            } else {
                newState.selectedTreeItems = [];
            }
        }
        if (!updateAnsynchronously && Object.keys(newState).length > 0) {
            dxContext.setState(newState);
            console.log("Updated state on route changes: " + JSON.stringify(newState));
        }
    }

    static updateTreeSelectionWithNodes(dxContext, pathsToLoad, newState) {
        dxContext.apolloJcr.executeQuery(LoadSelectionQuery, (result) => result.data.jcr.nodesByPath, null, {paths: pathsToLoad, language: dxContext.state.lang, displayLanguage: dxContext.state.uilang})
            .then((nodes) => {
                newState.selectedTreeItems = nodes;
                dxContext.setState(newState);
                console.log("Updated state on route changes with nodes: " + JSON.stringify(newState));
            });
    };

}

export {CmSelectionContext, CmSelectionHelper};