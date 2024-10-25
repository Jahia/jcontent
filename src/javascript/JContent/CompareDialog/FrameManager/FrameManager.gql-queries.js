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
    query RenderUrl($path: String!, $language: String!) {
        jcr {
            result: nodeByPath(path: $path) {
                ...NodeCacheRequiredFields
                renderUrlLive: renderUrl(workspace: LIVE, language: $language)
                renderUrlEdit: renderUrl(workspace: EDIT, language: $language)
                site {
                    serverName
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
