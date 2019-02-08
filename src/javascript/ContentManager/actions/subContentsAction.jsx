import {composeActions} from '@jahia/react-material';
import {map} from 'rxjs/operators';
import {routerAction} from './routerAction';

export default composeActions(routerAction, {
    init: context => {
        context.initRequirements({
            retrievePrimaryNodeType: true,
            retrieveSubNodes: true,
            enabled: context => context.node.pipe(map(node => node.primaryNodeType.name !== 'jnt:page' && node.primaryNodeType.name !== 'jnt:file' && node.subNodes.pageInfo.totalCount > 0))
        });
    }
});
