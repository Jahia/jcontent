import ContentManagerConstants from '../ContentManager.constants';
import * as _ from 'lodash';
import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/apollo-dx';

const GetAncestorsQuery = gql`
    query getAncestorsQuery($path:String!) {
        jcr {
            nodeByPath(path:$path) {
                ancestors(fieldFilter: {filters: {fieldName: "type.value", evaluation: AMONG, values:["jnt:page", "jnt:folder", "jnt:contentFolder"]}}) {
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

let treeExpanderAction = onClick => {
    return {
        onClick: context => {
            context.client.watchQuery({query: GetAncestorsQuery, variables: {path: context.path}}).subscribe(res => {
                let node = res.data.jcr.nodeByPath;

                let ancestorPaths = _.map(node.ancestors, ancestor => ancestor.path);

                let mode;
                let parent = node.ancestors[node.ancestors.length - 1];
                switch (parent.type.value) {
                    case 'jnt:contentFolder':
                        mode = ContentManagerConstants.mode.BROWSE;
                        break;
                    case 'jnt:folder':
                        mode = ContentManagerConstants.mode.FILES;
                        break;
                    default: {
                        let base = ancestorPaths[0].split('/');
                        base.pop();
                        ancestorPaths.splice(0, 0, base.join('/'));
                        mode = ContentManagerConstants.mode.BROWSE;
                    }
                }

                onClick(mode, ancestorPaths, context);
            });
        }
    };
};

export default treeExpanderAction;
