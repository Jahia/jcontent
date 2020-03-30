import JContentConstants from '../JContent.constants';
import * as _ from 'lodash';
import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

const GetAncestorsQuery = gql`
    query getAncestorsQuery($path:String!) {
        jcr {
            nodeByPath(path:$path) {
                ancestors(fieldFilter: {filters: {fieldName: "type.value", evaluation: AMONG, values:["jnt:page", "jnt:folder", "jnt:contentFolder", "jnt:virtualsite"]}}) {
                    type:property(name: "jcr:primaryType") {
                        value
                    }
                    name
                    path
                    ...NodeCacheRequiredFields
                }
                ...NodeCacheRequiredFields
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

export const expandTree = (path, client) => {
    return client.query({query: GetAncestorsQuery, variables: {path}}).then(res => {
        let node = res.data.jcr.nodeByPath;

        let ancestorPaths = _.map(node.ancestors, ancestor => ancestor.path);

        let mode;
        let parent = node.ancestors[node.ancestors.length - 1];
        switch (parent.type.value) {
            case 'jnt:contentFolder':
                mode = JContentConstants.mode.CONTENT_FOLDERS;
                break;
            case 'jnt:folder':
                mode = JContentConstants.mode.MEDIA;
                break;
            default: {
                let base = ancestorPaths[0].split('/');
                base.pop();
                ancestorPaths.splice(0, 0, base.join('/'));
                mode = JContentConstants.mode.PAGES;
            }
        }

        return {mode, ancestorPaths};
    });
};
