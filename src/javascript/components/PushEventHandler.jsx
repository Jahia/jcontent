import React from 'react';
import {registerPushEventHandler, unregisterPushEventHandler} from "./eventHandlerRegistry";
import {refetchContentTreeAndListData, refetchActiveWorkflowTasks} from './refetches';

/**
 * Renderless component that registers listeners for push events, sent by the Atmosphere Framework after content actions
 * or background / workflow task completion. This component then triggers the refetch of the data to "update" the data set.
 */
class PushEventHandler extends React.Component {

    constructor(props) {
        super(props);
        this.onPushEvent = this.onPushEvent.bind(this);
    }

    componentDidMount() {
        registerPushEventHandler(this.onPushEvent);
    }

    componentWillUnmount() {
        unregisterPushEventHandler(this.onPushEvent);
    }

    onPushEvent(eventData) {
        if (eventData) {
            let evtType = eventData.type;
            if (evtType === "workflowTask") {
                refetchActiveWorkflowTasks();
                if (eventData.endedWorkflow != null) {
                    refetchContentTreeAndListData();
                }
            } else if (evtType === "job") {
                if (this.hasProcessJob(eventData.startedJobs) || this.hasProcessJob(eventData.endedJobs)) {
                    refetchContentTreeAndListData();
                }
            } else if (evtType === "contentUnpublished") {
                refetchContentTreeAndListData();
            }
        }
    }

    hasProcessJob(jobs) {
        let found = false;
        if (jobs) {
            found = jobs.some(function(job) {
                return (job.group === "StartProcessJob" || job.group === "PublicationJob");
            });
        }
        return found;
    }

    render() {
        return null;
    }
}

export {PushEventHandler};