import {composeActions} from '@jahia/react-material';
import {map} from 'rxjs/operators';
import {routerAction} from './routerAction';

export default composeActions(routerAction, {
    init: context => {
        context.initRequirements({
            retrieveSubNodes: true,
            enabled: context => context.node.pipe(map(node => node.subNodes.pageInfo.totalCount > 0))
        });
    }
});
