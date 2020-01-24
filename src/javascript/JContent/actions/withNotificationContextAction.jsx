import React from 'react';
import {withNotifications} from '@jahia/react-material';

let NotificationConsumer = withNotifications()(props => props.children(props.notificationContext));

let withNotificationContextAction = {
    init: (context, props) => {
        context.notificationContext = props.notificationContext;
    },

    wrappers: [
        component => <NotificationConsumer>{notificationContext => React.cloneElement(component, {notificationContext})}</NotificationConsumer>
    ]
};

export {withNotificationContextAction};
