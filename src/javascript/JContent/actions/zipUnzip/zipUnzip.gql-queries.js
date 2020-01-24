import gql from 'graphql-tag';

const zipUnzipQueries = {
    siblingsWithSameNameQuery: gql`query getSiblings($uuid: String!, $name: String!, $extension: String!) {
        jcr {
            nodeById(uuid: $uuid) {
                parent {
                    filteredSubNodes: children(fieldFilter:{filters:[{evaluation:CONTAINS_IGNORE_CASE, fieldName: "name", value: $extension}, {evaluation: CONTAINS_IGNORE_CASE, fieldName: "name", value: $name}]}) {
                        nodes {
                            name: name
                        }
                    }
                }
            }
          }
        }`
};

export default zipUnzipQueries;
