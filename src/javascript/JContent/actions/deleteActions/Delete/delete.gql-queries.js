import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

const DeleteQueries = gql`
    query DeleteQueries($paths: [String!]!, $language:String!, $siteKey: String!) {
    jcr {
        nodesByPath(paths: $paths) {
            ...NodeCacheRequiredFields
            displayName(language: $language)
            pages : descendants(typesFilter:{types:["jnt:page"], multi:ANY}) {
                pageInfo {
                    totalCount
                }
            }
            content : descendants(typesFilter:{types:["jnt:content"], multi:ANY}) {
                pageInfo {
                    totalCount
                }
            }
            isPage: isNodeType(type:{types:  ["jnt:page"],multi: ALL})
            isMarkedForDeletionRoot: isNodeType(type:{types:  ["jmix:markedForDeletionRoot"],multi: ALL})
            isMarkedForDeletion: isNodeType(type:{types:  ["jmix:markedForDeletion"],multi: ALL})
            deletionInfo: properties(names: ["j:deletionUser","j:deletionDate","j:deletionMessage"]) {
                name
                value
            }
            rootDeletionInfo: ancestors(
                upToPath: $siteKey,
                fieldFilter: {
                    multi: ALL
                    filters: {
                        evaluation: EQUAL
                        fieldName: "isMarkedForDeletionRoot"
                        value: "true"
                    }
                }
            ) {
                ...NodeCacheRequiredFields
                isMarkedForDeletionRoot: isNodeType(
                    type: { types: ["jmix:markedForDeletionRoot"], multi: ALL }
                )
                displayName(language: $language)
                properties(
                    names: ["j:deletionUser", "j:deletionDate", "j:deletionMessage"]
                ) {
                    name
                    value
                }
            }
        }
    }
},
${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

export {DeleteQueries};
