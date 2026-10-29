import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';
import {NodePreviewFieldsFragment} from './queryHandlers/BaseQueryHandler.gql-queries';

/**
 * Everything ContentSidePanel reads off the node it is given.
 *
 * Published because the contract is not guessable and failing it does not fail: a node missing
 * `displayableNode` previews without the page's CSS, one missing `primaryNodeType` loses Details,
 * and nothing says so. A consumer selecting this fragment covers the whole panel.
 *
 * Takes no query variables on purpose, so it drops into any query. `displayName` is deliberately
 * NOT here - it needs `$language`, and the card falls back to `name`, which is.
 */
export const ContentSidePanelNodeFragment = gql`
    fragment ContentSidePanelNode on JCRNode {
        ...NodeCacheRequiredFields
        name
        primaryNodeType {
            name
        }
        # Read by the preview, which asks the render chain for content marked for deletion rather
        # than letting it come back blank. See buildPreviewContexts.
        mixinTypes {
            name
        }
        ...NodePreviewFields
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
    ${NodePreviewFieldsFragment}
`;

export default ContentSidePanelNodeFragment;
