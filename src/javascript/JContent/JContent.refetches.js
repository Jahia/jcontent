/**
 * Apollo's Query component allows one to use refetch function to rerun a query bound to the component.
 * The purpose of this code is to be able to create hooks to refetch functions and call them outside of Query components.
 *
 * Note that calling refetch() will use the same query parameters as used for the last call, but you can also supply new
 * parameters if needed.
 */

const JContentRefetches = {};

export const refetchTypes = {
    CONTENT_DATA: 'CONTENT_DATA',
    CONTENT_TREE: 'CONTENT_TREE'
};

export const setRefetcher = (name, refetcherData) => {
    JContentRefetches[name] = refetcherData;
};

export const unsetRefetcher = name => {
    delete JContentRefetches[name];
};

export const triggerRefetch = (name, queryParams) => {
    let refetch = JContentRefetches[name];
    if (!refetch) {
        return;
    }

    if (queryParams) {
        refetch.refetch(queryParams);
    } else {
        refetch.refetch();
    }
};

export const triggerRefetchAll = () => {
    Object.keys(JContentRefetches).forEach(key => triggerRefetch(key));
};
