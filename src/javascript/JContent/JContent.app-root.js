import {DSProvider} from '@jahia/design-system-kit';
import {NotificationProvider} from '@jahia/react-material';
import React from 'react';
import {triggerRefetchAll} from './JContent.refetches';
import Upload from './ContentRoute/ContentLayout/Upload';
import {JContentApi} from '~/JContent/JContentApi/JContentApi';
import {SnackbarProvider} from 'notistack';
import PublicationNotification from './PublicationStatus/PublicationNotification';
import CompareDialog from './CompareDialog';

export const jContentAppRoot = registry => {
    registry.add('app', 'jcontent-ds-provider', {
        targets: ['root:10'],
        render: next => (<DSProvider>{next}</DSProvider>)
    });

    registry.add('app', 'jcontent-notification-provider', {
        targets: ['root:11'],
        render: next => (<NotificationProvider notificationContext={{}}>{next}</NotificationProvider>)
    });

    registry.add('app', 'jcontent-compare-staging-live', {
        targets: ['root:12'],
        render: next => (
            <>
                <CompareDialog/>
                {next}
            </>
        )
    });

    registry.add('app', 'jcontent-notistack-provider', {
        targets: ['root:12'],
        render: next => (
            <>
                <SnackbarProvider/>
                <PublicationNotification/>
                {next}
            </>
        )
    });

    registry.add('app', 'jcontent-api', {
        targets: ['root:17'],
        render: next => (
            <>
                <JContentApi/>
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
};
