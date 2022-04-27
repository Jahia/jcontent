import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

const zipUnzipQueries = {
    siblingsWithSameNameQuery: gql`query getSiblings($uuid: String!, $name: String!, $extension: String!) {
        jcr {
            nodeById(uuid: $uuid) {
                ...NodeCacheRequiredFields
                parent {
                    ...NodeCacheRequiredFields
                    filteredSubNodes: children(fieldFilter:{filters:[{evaluation:CONTAINS_IGNORE_CASE, fieldName: "name", value: $extension}, {evaluation: CONTAINS_IGNORE_CASE, fieldName: "name", value: $name}]}) {
                        nodes {
                            ...NodeCacheRequiredFields
                            name: name
                        }
                    }
                }
            }
        }
    },
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
    `
};

export default zipUnzipQueries;
