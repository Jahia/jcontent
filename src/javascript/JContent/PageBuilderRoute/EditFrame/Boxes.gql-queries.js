import gql from 'graphql-tag';
import {QueryHandlersFragments} from '~/JContent/ContentRoute/ContentLayout/queryHandlers';

export const BoxesQuery = gql`
    query getNodes($paths:[String!]!, $language:String!, $displayLanguage:String!) {
        jcr {
            nodesByPath(paths: $paths) {
                ...NodeFields
            }
        }
    }
    ${QueryHandlersFragments.nodeFields.gql}
`;
