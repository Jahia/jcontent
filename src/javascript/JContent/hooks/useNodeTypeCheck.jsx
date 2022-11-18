import {useLazyQuery} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import * as _ from 'lodash';
import {useCallback} from 'react';

export function useNodeTypeCheck() {
    const [loadContentTypes, contentTypesResult] = useLazyQuery(gql`
        query PasteCheckQuery($nodeTypes: [String]!, $contributeTypes:[String]!, $childNodeTypes:[String]!) {
            jcr {
                nodeTypesByNames(names: $nodeTypes) {
                    name
                    contributeTypes: isNodeType(type:{multi:ANY, types: $contributeTypes})
                    childNodeTypes: isNodeType(type:{multi:ANY, types: $childNodeTypes})
                }
            }
        }
    `);

    return useCallback((target, sources) => {
        const primaryNodeTypesToPaste = [...new Set(sources.map(n => n.primaryNodeType.name))];
        const childNodeTypes = target.allowedChildNodeTypes.map(t => t.name);
        const contributeTypesProperty = target.contributeTypes ||
            (target.ancestors && target.ancestors.length > 0 && target.ancestors[target.ancestors.length - 1].contributeTypes);
        const contributeTypes = contributeTypesProperty ? contributeTypesProperty.values : [];

        if (contributeTypes.length === 0 && childNodeTypes.length === 0) {
            return {loading: false, checkResult: false};
        }

        const variables = {
            nodeTypes: primaryNodeTypesToPaste,
            childNodeTypes,
            contributeTypes
        };

        let shouldCallQuery = !contentTypesResult.called || !_.isEqual(variables, contentTypesResult.variables);

        if (shouldCallQuery) {
            loadContentTypes({variables});
        }

        if (contentTypesResult.loading || shouldCallQuery) {
            return {loading: true};
        }

        return {
            loading: false,
            checkResult: contentTypesResult.data.jcr.nodeTypesByNames.reduce((acc, val) => {
                return (
                    acc &&
                    (contributeTypes.length === 0 || val.contributeTypes) &&
                    (childNodeTypes.length === 0 || val.childNodeTypes)
                );
            }, true)
        };
    }, [loadContentTypes, contentTypesResult]);
}
