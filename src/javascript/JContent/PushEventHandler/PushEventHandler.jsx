import {useEffect} from 'react';
import {registerPushEventHandler, unregisterPushEventHandler} from '../eventHandlerRegistry';
import {triggerRefetchAll} from '../JContent.refetches';
import {useApolloClient} from 'react-apollo';

/**
 * Renderless component that registers listeners for push events, sent by the Atmosphere Framework after content actions
 * or background / workflow task completion. This component then triggers the refetch of the data to "update" the data set.
 */
export const PushEventHandler = () => {
    const client = useApolloClient();
    useEffect(() => {
        registerPushEventHandler(onPushEvent);
        return () => {
            unregisterPushEventHandler(onPushEvent);
        };
    });

    const hasProcessJob = jobs => {
        return jobs && jobs.some(job => job.group === 'StartProcessJob' || job.group === 'PublicationJob');
    };

    const onPushEvent = eventData => {
        if (eventData) {
            let evtType = eventData.type;
            if (evtType === 'workflowTask') {
                if (eventData.endedWorkflow !== null) {
                    triggerRefetchAll();
                }
            } else if (evtType === 'job') {
                if (hasProcessJob(eventData.endedJobs)) {
                    eventData.endedJobs.forEach(job => {
                        if (job.targetPaths) {
                            job.targetPaths.forEach(path => {
                                client.cache.flushNodeEntryByPath(path);
                            });
                        }
                    });
                    triggerRefetchAll();
                }
            } else if (evtType === 'contentUnpublished') {
                triggerRefetchAll();
            }
        }
    };

    return false;
};
