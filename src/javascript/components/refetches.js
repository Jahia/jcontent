/**
 * Apollo's Query component allows one to use refetch function to rerun a query bound to the component.
 * The purpose of this code is to be able to create hooks to refetch functions and call them outside of Query components.
 *
 * Note that calling refetch() will use the same query parameters as used for the last call, but you can also supply new
 * parameters if needed.
 */
import * as _ from 'lodash';
import Constants from "./constants";

const refetches = {};

export const refetchTypes = {
    "CONTENT_DATA": "CONTENT_DATA",
    "CONTENT_TREE": "CONTENT_TREE",
    "ACTIVE_WORKFLOW_TASKS": "ACTIVE_WORKFLOW_TASKS"
};

export const setRefetcher = (name, refetcherData) => {
    refetches[name] = refetcherData;
};

export const triggerRefetch = (name, queryParams) => {
    getRefetches(name).forEach(function(ref) {
        doTriggerRefetch(ref, queryParams);
    });
};

function doTriggerRefetch(refetch, queryParams) {
    if (queryParams) {
        refetch.refetch(queryParams)
    } else {
        refetch.refetch()
    }
}

function getRefetches(name) {
    if (refetchTypes.CONTENT_TREE === name) {
        let refs = new Array();
        _.forOwn(Constants.contentTreeConfigs, function(cfg) {
            let ref = refetches[cfg.key];
            if (ref) {
                refs.push(ref);
            }
        });
        return refs;
    } else {
        return [refetches[name]];
    }
}