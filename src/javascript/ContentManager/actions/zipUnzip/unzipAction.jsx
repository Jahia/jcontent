import {composeActions} from '@jahia/react-material';
import requirementsAction from '../requirementsAction';
import {withNotificationContextAction} from '../withNotificationContextAction';
import * as _ from 'lodash';
import {map} from 'rxjs/operators';
import zipUnzipMutations from './zipUnzip.gql-mutations';
import {refetchContentTreeAndListData} from '../../ContentManager.refetches';

export default composeActions(requirementsAction, withNotificationContextAction, {
    init: context => {
        context.initRequirements({
            retrieveMimeType: true,
            enabled: context => context.node.pipe(map(node => !_.isEmpty(node.children.nodes) && node.children.nodes[0].mimeType.value === 'application/zip'))
        });
    },
    onClick: context => {
        context.client.mutate({
            variables: {pathOrId: context.node.path, path: context.node.parent.path},
            mutation: zipUnzipMutations.unzip
        }).catch((reason => context.notificationContext.notify(reason.toString(), ['closeButton', 'noAutomaticClose'])));
        refetchContentTreeAndListData();
    }
});
