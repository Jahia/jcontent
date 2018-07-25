import React from 'react';
import { DxContext } from "./DxContext";
import * as _ from 'lodash';

class ActionProvider extends React.Component {

    render() {
        const { targetName, path, name, children } = this.props;
        return (<DxContext.Consumer>
            {dxContext => {
                const actions = _.sortBy(_.filter(dxContext.config.actions, action => _.includes(action.target, targetName)), "priority");

                return _.map(actions, action => {
                        let Action = dxContext.actionsRegistry(action.action);
                        Action = Action || dxContext.actionsRegistry("action");
                        return Action &&
                            (
                                <Action {...action} path={path} name={name} key={action.id}>
                                    {children}
                                </Action>
                            )
                })
            }}
        </DxContext.Consumer>)
    }
}

export default ActionProvider
