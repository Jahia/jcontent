import ContentManagerConstants from '../ContentManager.constants';
import {ContentTypeNamesQuery, ContentTypesQuery} from './actions.gql-queries';
import * as _ from 'lodash';
import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {from, of} from 'rxjs';
import {filter, map, switchMap} from 'rxjs/operators';
import {withDxContextAction} from './withDxContextAction';
import {reduxAction} from './reduxAction';

const mapStateToProps = state => ({
    params: state.params
});

function filterByBaseType(types, baseTypeName) {
    return _.filter(types, type => {
        let superTypes = _.map(type.supertypes, superType => superType.name);
        return _.includes(superTypes, baseTypeName);
    });
}

export default composeActions(requirementsAction, withDxContextAction, reduxAction(mapStateToProps, null), {

    init: context => {
        let {baseContentType, params} = context;
        if (!baseContentType || params.sub || params.sub === true) {
            baseContentType = 'nt:base';
        }

        context.initRequirements({
            requiredPermission: 'jcr:addChildNodes',
            baseContentType,
            getContributeTypesRestrictions: true
        });
        let obs = context.node.pipe(switchMap(node => {
            let childNodeTypes = _.union(filterByBaseType(node.allowedChildNodeTypes, baseContentType),
                filterByBaseType(node.allowedChildNodeTypes, baseContentType));
            let childNodeTypeNames = _.map(childNodeTypes, nodeType => nodeType.name);
            let contributeTypesProperty = node.contributeTypes ||
                (node.ancestors && !_.isEmpty(node.ancestors) && node.ancestors[node.ancestors.length - 1].contributeTypes);
            if (contributeTypesProperty && !_.isEmpty(contributeTypesProperty.values) && !_.isEmpty(childNodeTypes)) {
                return from(context.client.query({query: ContentTypesQuery, variables: {nodeTypes: contributeTypesProperty.values}})).pipe(
                    filter(res => (res.data && res.data.jcr)),
                    map(res => {
                        let contributionNodeTypes = res.data.jcr.nodeTypesByNames;
                        contributionNodeTypes = filterByBaseType(contributionNodeTypes, baseContentType);
                        return _.map(contributionNodeTypes, nodeType => nodeType.name);
                    })
                );
            }
            return of(childNodeTypeNames);
        }), switchMap(nodeTypes => {
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
        context.nodeTypes = obs.pipe(map(r => r.nodeTypes));
        context.includeSubTypes = obs.pipe(map(r => r.includeSubTypes));
        context.actions = obs.pipe(map(r => r.actions));
    },

    onClick: context => {
        window.parent.authoringApi.createContent(context.path, context.nodeTypes, context.includeSubTypes);
    }

});
