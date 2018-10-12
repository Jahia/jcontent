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
            console.log("Event recieved: " + JSON.stringify(eventData));
            if (eventData.type === "workflowTask") {
                triggerRefetch(refetchTypes.ACTIVE_WORKFLOW_TASKS);
                if (eventData.endedWorkflow != null) {
                    triggerRefetch(refetchTypes.CONTENT_DATA);
                    triggerRefetch(refetchTypes.CONTENT_TREE);
                }
            } else if (eventData.type === "job") {
                if (this.hasProcessJob(eventData.startedJob) || this.hasProcessJob(eventData.endedJob)) {
                    triggerRefetch(refetchTypes.CONTENT_DATA);
                    triggerRefetch(refetchTypes.CONTENT_TREE);
                }
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

export {PushEventConsumer};