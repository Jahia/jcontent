import {DSProvider} from '@jahia/design-system-kit';
import {NotificationProvider} from '@jahia/react-material';
import {PushEventHandler} from './PushEventHandler';
import React from 'react';
import {triggerRefetchAll} from './JContent.refetches';
import Upload from './ContentRoute/ContentLayout/Upload';
import ContentBreadcrumb from './ContentRoute/ContentBreadcrumb';

export const jContentAppRoot = registry => {
    registry.add('app', 'jcontent-ds-provider', {
        targets: ['root:10'],
        render: next => (<DSProvider>{next}</DSProvider>)
    });

    registry.add('app', 'jcontent-notification-provider', {
        targets: ['root:11'],
        render: next => (<NotificationProvider notificationContext={{}}>{next}</NotificationProvider>)
    });

    registry.add('app', 'jcontent-push-event-handler', {
        targets: ['root:14'],
        render: next => (
            <>
                <PushEventHandler/>
                {next}
            </>
        )
    });
    registry.add('app', 'jcontent-upload', {
        targets: ['root:17'],
        render: next => (
            <>
                <Upload
                    uploadUpdateCallback={status => {
                        if (status && status.uploading === 0) {
                            const refetchCallbacks = registry.find({type: 'refetch-upload'});
                            if (refetchCallbacks.length > 0) {
                                refetchCallbacks.forEach(refetchCallback => {
                                    if (refetchCallback.refetch) {
                                        refetchCallback.refetch();
                                    }
                                });
                            } else {
                                triggerRefetchAll();
                            }
                        }
                    }}
                />
                {next}
            </>
        )
    });

    registry.add('app', 'jcontent-bread-crumb', {
        targets: ['jcontent-bread-crumb:1'],
        render: path => <ContentBreadcrumb externalPath={path}/>
    });
};
