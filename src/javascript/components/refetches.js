/**
 * Apollo's Query component allows one to use refetch function to rerun a query bound to the component.
 * The purpose of this code is to be able to create hooks to refetch functions and call them outside of Query components.
 *
 * Note that calling refetch() will use the same query parameters as used for the last call, but you can also supply new
 * parameters if needed.
 */

const refetches = {};

export const refetchTypes = {
    "CONTENT_DATA": "CONTENT_DATA",
    "ACTIVE_WORKFLOW_TASKS": "ACTIVE_WORKFLOW_TASKS"
};

export const setRefetcher = (name, refetcherData) => {
    refetches[name] = refetcherData;
};

export const triggerRefetch = (name, queryParams) => {
    let refetch = refetches[name];
    if (!refetch) {
        return;
    }
    if (queryParams) {
        refetch.refetch(queryParams);
    } else {
        refetch.refetch();
    }
};
