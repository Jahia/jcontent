import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

export const RenderCheckQuery = gql`
    query renderCheck($path: String!, $language: String!, $view: String = "default") {
        jcr {
            nodeByPath(path: $path) {
                ...NodeCacheRequiredFields
                renderedContent(view: $view, templateType: "html", contextConfiguration: "page", language: $language) {
                    output
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;
