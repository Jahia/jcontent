import {useState} from 'react';
import {useQuery} from '@apollo/client';
import {CONTENT_PREVIEW_QUERY, CONTENT_PREVIEW_UNSAVED_VALUES_QUERY} from './useContentPreview.gql-queries';

// The server runs no other operation after a query of unsaved values in the same HTTP request. The batching link of the
// page groups the operations whose headers are equal, so each caller of such a query takes a header value of its own,
// which separates its query from every other operation, the query of another editor that refetches with it included.
let lastCallerId = 0;

/**
 * The context of the queries of unsaved values of one caller, with a header value that no other caller shares.
 * @param {string} kind the kind of the queries, which starts the value
 * @returns {object} the context, the same at each render of the caller
 */
export const useUnsavedValuesContext = kind => {
    const [context] = useState(() => {
        lastCallerId += 1;
        return {headers: {'X-Jahia-Unsaved-Values': `${kind}-${lastCallerId}`}};
    });
    return context;
};

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
    const unsavedValuesContext = useUnsavedValuesContext('preview');
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
        context: unsavedValues ? unsavedValuesContext : undefined,
        skip
    });
};
