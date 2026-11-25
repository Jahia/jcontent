import {useQuery} from '@apollo/client';
import {CONTENT_PREVIEW_QUERY, CONTENT_PREVIEW_UNSAVED_VALUES_QUERY} from './useContentPreview.gql-queries';

// The server runs no other operation after a query of unsaved values in the same HTTP request. The batching link of the
// page groups the operations whose headers are equal, so each query of unsaved values takes a header value of its own,
// which separates it from every other operation. Two queries with the same value must not start in one batch interval.
const UNSAVED_VALUES_PREVIEW_CONTEXT = {headers: {'X-Jahia-Unsaved-Values': 'preview'}};
export const UNSAVED_VALUES_SUPPORT_CONTEXT = {headers: {'X-Jahia-Unsaved-Values': 'support'}};

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
        context: unsavedValues ? UNSAVED_VALUES_PREVIEW_CONTEXT : undefined,
        skip
    });
};
