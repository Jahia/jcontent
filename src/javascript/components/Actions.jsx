import React from 'react';
import { DxContext } from "./DxContext";
import * as _ from 'lodash';

class Actions extends React.Component {

    render() {
        const { menuId, path, name, children } = this.props;
        return (<DxContext.Consumer>
            {dxContext => {
                const allActions = dxContext.config.actions;
                const actionsToDisplayKeys = _.sortBy(_.filter(Object.keys(allActions), actionKey => _.includes(allActions[actionKey].target, menuId)), "priority");

                return _.map(actionsToDisplayKeys, actionKey => {
                        let action = allActions[actionKey];
                        let Action = dxContext.actionsRegistry(action.component);
                        Action = Action || dxContext.actionsRegistry("action");
                        return Action &&
                            (
                                <Action {...action} path={path} name={name} key={actionKey}>
                                    {children}
                                </Action>
                            )
                })
            }}
        </DxContext.Consumer>)
    }
}

export default Actions
