import ContentManagerConstants from '../ContentManager.constants';
import {ContentTypeNamesQuery, ContentTypesQuery} from './actions.gql-queries';
import * as _ from 'lodash';
import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {from, of, ReplaySubject} from 'rxjs';
import {filter, first, map, switchMap} from 'rxjs/operators';
import {withDxContextAction} from './withDxContextAction';

function filterByBaseType(types, baseTypeName, supertypesProp) {
    return _.filter(types, type => {
        let superTypes = _.map(type[supertypesProp], superType => superType.name);
        return _.includes(superTypes, baseTypeName);
    });
}

export default composeActions(requirementsAction, withDxContextAction, {

    init: context => {
        context.initRequirements({
            requiredPermission: 'jcr:addChildNodes',
            baseContentType: true,
            getContributeTypesRestrictions: true,
            retrievePrimaryNodeType: true
        });

        let obs = context.node.pipe(switchMap(node => {
            let useEditorialContent = node.primaryNodeType.name === 'jnt:page' || node.primaryNodeType.name === 'jnt:contentFolder';
            let childNodeTypes = useEditorialContent ? filterByBaseType(node.allowedChildNodeTypesEditorialContent, 'jmix:editorialContent', 'supertypesEditorialContent') :
                filterByBaseType(node.allowedChildNodeTypesBase, 'nt:base', 'supertypesBase');
            let childNodeTypeNames = _.map(childNodeTypes, nodeType => nodeType.name);
            let contributeTypesProperty = node.contributeTypes ||
                (node.ancestors && !_.isEmpty(node.ancestors) && node.ancestors[node.ancestors.length - 1].contributeTypes);
            if (contributeTypesProperty && !_.isEmpty(contributeTypesProperty.values) && !_.isEmpty(childNodeTypes)) {
                return from(context.client.query({query: ContentTypesQuery, variables: {nodeTypes: contributeTypesProperty.values}})).pipe(
                    filter(res => (res.data && res.data.jcr)),
                    map(res => {
                        let contributionNodeTypes = res.data.jcr.nodeTypesByNames;
                        contributionNodeTypes = filterByBaseType(contributionNodeTypes, useEditorialContent ? 'jmix:editorialContent' : 'nt:base', 'supertypes');
                        return _.map(contributionNodeTypes, nodeType => nodeType.name);
                    })
                );
            }

            return of(childNodeTypeNames);
        }), switchMap(nodeTypes => {
            if (_.size(nodeTypes) === 0) {
                return of({actions: []});
            }

            if (_.size(nodeTypes) > ContentManagerConstants.maxCreateContentOfTypeDirectItems || _.includes(nodeTypes, 'jmix:droppableContent')) {
                return of({
                    includeSubTypes: true,
                    nodeTypes: nodeTypes
                });
            }

            return from(context.client.query({query: ContentTypeNamesQuery, variables: {nodeTypes: nodeTypes, displayLanguage: context.dxContext.uilang}})).pipe(
                filter(res => (res.data && res.data.jcr)),
                map(res => ({
                    actions: res.data.jcr.nodeTypesByNames.map(nodeType => ({
                        key: nodeType.name,
                        includeSubTypes: false,
                        nodeTypes: [nodeType.name],
                        buttonLabel: 'label.contentManager.create.contentOfType',
                        buttonLabelParams: {typeName: nodeType.displayName}
                    }))
                })
                )
            );
        }));
        let replay = new ReplaySubject(1).pipe(first());
        obs.subscribe(replay);
        context.nodeTypes = replay.pipe(map(r => r.nodeTypes));
        context.includeSubTypes = replay.pipe(map(r => r.includeSubTypes));
        context.actions = replay.pipe(map(r => r.actions));
    },

    onClick: context => {
        window.parent.authoringApi.createContent(context.path, context.nodeTypes, context.includeSubTypes);
    }

});
