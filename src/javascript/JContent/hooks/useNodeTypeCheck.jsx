import {useLazyQuery} from '@apollo/client';
import gql from 'graphql-tag';
import * as _ from 'lodash';
import {useCallback} from 'react';
import {JahiaAreasUtil} from '~/JContent/JContent.utils';

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

        const areaElem = JahiaAreasUtil.getArea(target.path) || {};
        const areaNodeTypes = areaElem.nodeTypes?.split(' ');
        const childNodeTypes = target.allowedChildNodeTypes.map(t => t.name);

        // Merge restrictions from content and template definitions
        const contributeTypesSet = new Set([...(areaNodeTypes || []), ...(target.contributeTypes?.values || [])]);
        contributeTypesSet.delete('jmix:droppableContent'); // ignore if only contains default allowedType
        const contributeTypesProperties = (contributeTypesSet.size > 0 && [...contributeTypesSet]) ||
            (target.ancestors?.length > 0 && target.ancestors[target.ancestors.length - 1].contributeTypes?.values);
        const targetIsContentTypeRestrictCapable = ['jnt:contentList', 'jnt:folder', 'jnt:contentFolder', 'jnt:area', 'jnt:mainResourceDisplay'].find(type => target[type] || target.primaryNodeType?.name === type) !== undefined;
        const contributeTypes = (targetIsContentTypeRestrictCapable && contributeTypesProperties) ? contributeTypesProperties : [];

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
            setTimeout(() => {
                loadContentTypes({variables});
            });
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
