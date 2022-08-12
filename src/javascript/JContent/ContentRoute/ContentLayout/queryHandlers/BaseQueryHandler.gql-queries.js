import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

export const QueryHandlersFragments = {
    childNodesCount: {
        gql: gql`
            fragment ChildNodesCount on JCRNode {
                subNodes: children(typesFilter: {types: ["jnt:file", "jnt:folder", "jnt:content", "jnt:contentFolder"], multi: ANY}) {
                    pageInfo {
                        totalCount
                    }
                }
            }
        `,
        applyFor: 'node'
    },

    nodeFields: {
        gql: gql`
            fragment NodeFields on JCRNode {
                name
                displayName(language: $language)
                createdBy: property(name: "jcr:createdBy") {
                    value
                }
                created: property(name: "jcr:created") {
                    value
                }
                primaryNodeType {
                    name
                    displayName(language: $displayLanguage)
                    icon
                }
                mixinTypes {
                    name
                }
                operationsSupport {
                    lock
                    markForDeletion
                    publication
                }
                aggregatedPublicationInfo(language: $language) {
                    publicationStatus
                }
                lockOwner: property(name: "jcr:lockOwner") {
                    value
                }
                lastPublished: property(name: "j:lastPublished", language: $language) {
                    value
                }
                lastPublishedBy: property(name: "j:lastPublishedBy", language: $language) {
                    value
                }
                lastModifiedBy: property(name: "jcr:lastModifiedBy", language: $language) {
                    value
                }
                lastModified: property(name: "jcr:lastModified", language: $language) {
                    value
                }
                deletedBy: property(name: "j:deletionUser", language: $language) {
                    value
                }
                deleted: property(name: "j:deletionDate", language: $language) {
                    value
                }
                wipStatus: property(name: "j:workInProgressStatus") {
                    value
                }
                wipLangs: property(name: "j:workInProgressLanguages") {
                    values
                }
                ancestors(fieldFilter: {filters: {fieldName: "deletionDate", evaluation: NOT_EMPTY}}) {
                    deletionDate:property(name: "j:deletionDate") {
                        value
                    }
                    deletionUser: property(name: "j:deletionUser") {
                        value
                    }
                }
                notSelectableForPreview: isNodeType(type: {types:["jnt:page", "jnt:folder", "jnt:contentFolder"]})
                site {
                    ...NodeCacheRequiredFields
                }
                parent {
                    ...NodeCacheRequiredFields
                    path
                }
                ...NodeCacheRequiredFields
            }
            ${PredefinedFragments.nodeCacheRequiredFields.gql}
        `,
        applyFor: 'node'
    }
};

export const BaseChildrenQuery = gql`
    query getNodeChildren($path:String!, $language:String!, $offset:Int, $limit:Int, $displayLanguage:String!, $typeFilter:[String]!, $fieldSorter: InputFieldSorterInput, $fieldGrouping: InputFieldGroupingInput) {
        jcr {
            nodeByPath(path: $path) {
                ...NodeFields
                children(offset: $offset, limit: $limit, typesFilter: {types: $typeFilter, multi: ANY}, fieldSorter: $fieldSorter, fieldGrouping: $fieldGrouping) {
                    pageInfo {
                        totalCount
                    }
                    nodes {
                        ...NodeFields
                        ...node
                        ...ChildNodesCount
                    }
                }
            }
        }
    }
    ${QueryHandlersFragments.nodeFields.gql}
    ${QueryHandlersFragments.childNodesCount.gql}
`;

export const BaseDescendantsQuery = gql`
    query getNodeSubTree($path:String!, $language:String!, $offset:Int, $limit:Int, $displayLanguage:String!, $typeFilter:[String]!, $recursionTypesFilter: InputNodeTypesInput, $fieldSorter: InputFieldSorterInput, $fieldGrouping: InputFieldGroupingInput) {
        jcr {
            nodeByPath(path: $path) {
                ...NodeFields
                children: descendants(offset:$offset, limit:$limit, typesFilter: {types: $typeFilter, multi: ANY}, recursionTypesFilter: $recursionTypesFilter, fieldSorter: $fieldSorter, fieldGrouping: $fieldGrouping) {
                    pageInfo {
                        totalCount
                    }
                    nodes {
                        ...NodeFields
                        ...node
                        ...ChildNodesCount
                    }
                }
            }
        }
    }
    ${QueryHandlersFragments.nodeFields.gql}
    ${QueryHandlersFragments.childNodesCount.gql}
`;
