import React from 'react';
import {registerPushEventConsumer, unregisterPushEventConsumer} from "./eventHandlerRegistry";
import {triggerRefetch, refetchTypes} from './refetches';

class PushEventConsumer extends React.Component {

    constructor(props) {
        super(props);
        this.onPushEvent = this.onPushEvent.bind(this);
    }

    componentDidMount() {
        registerPushEventConsumer(this.onPushEvent);
    }

    componentWillUnmount() {
        unregisterPushEventConsumer(this.onPushEvent);
    }

    onPushEvent(eventData) {
        if (eventData) {
            let evtType = eventData.type;
            if (evtType === "workflowTask") {
                triggerRefetch(refetchTypes.ACTIVE_WORKFLOW_TASKS);
                if (eventData.endedWorkflow != null) {
                    triggerDataRefetch();
                }
            } else if (evtType === "job") {
                if (this.hasProcessJob(eventData.startedJob) || this.hasProcessJob(eventData.endedJob)) {
                    triggerDataRefetch();
                }
            } else if (evtType === "contentUnpublished") {
                triggerDataRefetch();
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

    triggerDataRefetch() {
        triggerRefetch(refetchTypes.CONTENT_DATA);
        triggerRefetch(refetchTypes.CONTENT_TREE);
    }

    render() {
        return null;
    }
}

export {PushEventConsumer};