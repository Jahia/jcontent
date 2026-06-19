import {useQuery} from '@apollo/client';
import {CONTENT_PREVIEW_QUERY} from './useContentPreview.gql-queries';

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

    return useQuery(CONTENT_PREVIEW_QUERY, {
        variables,
        errorPolicy: 'all',
        fetchPolicy,
        skip
    });
};
