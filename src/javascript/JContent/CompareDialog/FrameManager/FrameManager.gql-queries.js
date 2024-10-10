import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

export const DiffHtml = gql`
    query DiffHtml($original: String!, $new: String!) {
        jcontent {
            diffHtml(newHtml: $original, originalHtml: $new)
        }
    }
`;

export const RenderUrl = gql`
    query RenderUrl($path: String!, $language: String!, $workspace: Workspace!) {
        jcr {
            result: nodeByPath(path: $path) {
                ...NodeCacheRequiredFields
                renderUrl(workspace: $workspace, language: $language)
                site {
                    serverName
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
