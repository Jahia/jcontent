import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

export const GetUserQuery = gql`query getCurrentUser {
    currentUser {
        node {
            path
            ...NodeCacheRequiredFields
        }
    }
}
${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
