import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

const OpenInActionQuery = gql`
    query openInActionQuery($path: String!, $language: String!, $workspace: Workspace!) {
        jcr {
            result: nodeByPath(path: $path) {
                ...NodeCacheRequiredFields
                previewAvailable: isNodeType(type: {multi: ANY, types: ["jnt:page","jmix:mainResource"]})
                displayableNode {
                    ...NodeCacheRequiredFields
                    previewAvailable: isNodeType(type: {multi: ANY, types: ["jnt:page","jmix:mainResource"]})
                }
                publicationInfo: aggregatedPublicationInfo(language: $language, references: false, subNodes: false) {
                    existsInLive
                    status: publicationStatus
                }
                renderUrl(workspace: $workspace, language: $language)
                site {
                    ...NodeCacheRequiredFields
                    serverName
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

export {OpenInActionQuery};
