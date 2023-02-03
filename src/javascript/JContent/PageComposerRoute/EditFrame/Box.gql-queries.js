import gql from 'graphql-tag';
import {QueryHandlersFragments} from '~/JContent/ContentRoute/ContentLayout/queryHandlers';

export const BoxQuery = gql`
    query getNode($path:String!, $language:String!, $displayLanguage:String!) {
        jcr {
            nodeByPath(path: $path) {
                ...NodeFields
            }
        }
    }
    ${QueryHandlersFragments.nodeFields.gql}
`;
