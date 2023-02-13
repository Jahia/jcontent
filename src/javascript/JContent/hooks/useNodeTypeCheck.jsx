import {useLazyQuery} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import * as _ from 'lodash';
import {useCallback} from 'react';

export function useNodeTypeCheck() {
    const [loadContentTypes, contentTypesResult] = useLazyQuery(gql`
        query PasteCheckQuery($nodeTypes: [String]!, $contributeTypes:[String]!, $childNodeTypes:[String]!, $referenceTypes:[String]!, $isReference: Boolean!) {
            jcr {
                nodeTypesByNames(names: $nodeTypes) {
                    name
                    isContributeType: isNodeType(type:{multi:ANY, types: $contributeTypes})
                    isChildNodeType: isNodeType(type:{multi:ANY, types: $childNodeTypes})
                }
                referenceTypes: nodeTypesByNames(names: $referenceTypes) @include(if: $isReference) {
                    name
                    isChildNodeType: isNodeType(type:{multi:ANY, types: $childNodeTypes})
                }
            }
        }
    `);

    return useCallback((target, sources, referenceTypes) => {
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
            contributeTypes,
            isReference: Boolean(referenceTypes),
            referenceTypes: referenceTypes || []
        };

        let shouldCallQuery = !contentTypesResult.called || !_.isEqual(variables, contentTypesResult.variables);

        if (shouldCallQuery) {
            loadContentTypes({variables});
        }

        if (contentTypesResult.loading || shouldCallQuery) {
            return {loading: true};
        }

        // Type should match childNodeTypes and contributeTypes, if they are set.
        const result = {
            loading: false,
            checkResult: contentTypesResult.data.jcr.nodeTypesByNames.reduce((acc, val) => acc && (contributeTypes.length === 0 || val.isContributeType) && (childNodeTypes.length === 0 || val.isChildNodeType), true)
        };

        // In case of reference - type should match childNodeTypes and contributeTypes, if they are set - and the reference type should match childNodeTypes, if set
        if (referenceTypes && result.checkResult) {
            result.possibleReferenceTypes = contentTypesResult.data.jcr.referenceTypes.filter(val => (childNodeTypes.length === 0 || val.isChildNodeType));
            result.checkResult = result.possibleReferenceTypes.length > 0;
        }

        return result;
    }, [loadContentTypes, contentTypesResult]);
}
