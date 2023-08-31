import {registry} from '@jahia/ui-extender';

/**
 * Apollo's Query component allows one to use refetch function to rerun a query bound to the component.
 * The purpose of this code is to be able to create hooks to refetch functions and call them outside of Query components.
 *
 * Note that calling refetch() will use the same query parameters as used for the last call, but you can also supply new
 * parameters if needed.
 */

export const refetchTypes = {
    CONTENT_DATA: 'CONTENT_DATA',
    CONTENT_TREE: 'CONTENT_TREE',
    PAGE_BUILDER_BOXES: 'PAGE_BUILDER_BOXES',
    PREVIEW_COMPONENT: 'PREVIEW_COMPONENT'
};

export const setRefetcher = (name, refetcherData) => {
    registry.addOrReplace('refetcher', name, refetcherData);
};

export const unsetRefetcher = name => {
    delete registry.registry['refetcher-' + name];
};

export const triggerRefetch = (name, queryParams) => {
    const refetch = registry.get('refetcher', name);
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
    registry.find({type: 'refetcher'}).forEach(refetch => triggerRefetch(refetch.key));
};
