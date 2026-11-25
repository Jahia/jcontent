import {useQuery} from '@apollo/client';
import {CONTENT_PREVIEW_QUERY, CONTENT_PREVIEW_UNSAVED_VALUES_QUERY} from './useContentPreview.gql-queries';

// The server runs no other operation after a query of unsaved values in the same HTTP request. A header of its own
// gives the query its own batch in the batching link of the page, so it travels alone.
export const UNSAVED_VALUES_CONTEXT = {headers: {'X-Jahia-Unsaved-Values': 'true'}};

export const useContentPreview = ({
    path,
    workspace,
    language,
    templateType,
    view,
    contextConfiguration,
    requestAttributes,
    fetchPolicy,
    mainResourcePath,
    unsavedValues = null,
    skip = false
}) => {
    const variables = {
        path,
        templateType,
        view,
        contextConfiguration,
        language,
        workspace: workspace.toUpperCase(),
        requestAttributes,
        mainResourcePath
    };

    if (unsavedValues) {
        variables.unsavedValues = unsavedValues;
    }

    return useQuery(unsavedValues ? CONTENT_PREVIEW_UNSAVED_VALUES_QUERY : CONTENT_PREVIEW_QUERY, {
        variables,
        errorPolicy: 'all',
        // An unsaved value never enters the cache, where it would replace the stored value of the node.
        fetchPolicy: unsavedValues ? 'no-cache' : fetchPolicy,
        context: unsavedValues ? UNSAVED_VALUES_CONTEXT : undefined,
        skip
    });
};
