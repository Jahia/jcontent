import React from 'react';
import PropTypes from 'prop-types';
import {compose} from 'react-apollo';
import {withTranslation} from 'react-i18next';
import {Route, Switch, withRouter} from 'react-router';
import {registry} from '@jahia/ui-extender';

export class AppLayoutContainer extends React.Component {
    render() {
        let routes = registry.find({type: 'route', target: 'jcontent'});
        const {dxContext, t} = this.props;

        return (
            <Switch>
                {routes.map(r =>
                    <Route key={r.key} path={r.path} render={props => r.render(props, {dxContext, t})}/>
                )}
            </Switch>
        );
    }
}

AppLayoutContainer.propTypes = {
    dxContext: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired
};

export default compose(
    withRouter,
    withTranslation()
)(AppLayoutContainer);
