import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

const getImageMutation = transforms => gql`
    mutation ImageMutation($path:String!, $name: String) {
        jcr {
            mutateNode(pathOrId: $path) {
                transformImage(name: $name) {
                    ${transforms.map((t, idx) => 'op' + idx + ':' + t.op + '(' + Object.keys(t.args).map(k => k + ':' + JSON.stringify(t.args[k])) + ')')}
                    node {
                        ...NodeCacheRequiredFields
                    }
                }
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}

`;

export {getImageMutation};
