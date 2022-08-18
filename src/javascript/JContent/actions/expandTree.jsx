import * as _ from 'lodash';
import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';
import {registry} from '@jahia/ui-extender';
import {getCanDisplayItemParams} from '~/JContent/JContent.utils';

const GetAncestorsQuery = gql`
    query getAncestorsQuery($path:String!) {
        jcr {
            nodeByPath(path:$path) {
                ancestors(fieldFilter: {filters: {fieldName: "primaryNodeType.name", evaluation: AMONG, values:["jnt:page", "jnt:folder", "jnt:contentFolder", "jnt:virtualsite", "jnt:virtualsitesFolder"]}}) {
                    primaryNodeType {
                        name
                    }
                    name
                    path
                    ...NodeCacheRequiredFields
                }
                primaryNodeType {
                    name
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
        const params = {selectionNode: node};
        const acc = registry.find({type: 'accordionItem', target: 'jcontent'}).find(acc => acc.canDisplayItem && acc.canDisplayItem(params));
        const mode = acc.key;
        const parentPath = acc.getPathForItem(node);
        const viewType = acc.getViewTypeForItem ? acc.getViewTypeForItem(node) : null;
        const ancestorPaths = _.map(node.ancestors, ancestor => ancestor.path);

        return {mode, parentPath, ancestorPaths, viewType};
    });
};
