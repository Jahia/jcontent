import React from 'react';
import * as _ from 'lodash';
import actionsRegistry from "./actionsRegistry"

class Actions extends React.Component {

    render() {
        const {menuId, path, name, children} = this.props;
        // Filter action for the current MenuId
        const actionsToDisplayKeys = _.sortBy(_.filter(Object.keys(actionsRegistry), actionKey => _.includes(actionsRegistry[actionKey].target, menuId)), "priority");

        return _.map(actionsToDisplayKeys, actionKey => {
                let action = actionsRegistry[actionKey];
                let ActionComponent = action.component;
                ActionComponent = ActionComponent || dxContext.actionsRegistry("action");
                return ActionComponent &&
                    (
                        <ActionComponent {...action} path={path} name={name} key={actionKey}>
                            {children}
                        </ActionComponent>
                    )
            }
        )
    }
}

export default Actions
