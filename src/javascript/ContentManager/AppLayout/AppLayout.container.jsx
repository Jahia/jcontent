import React from 'react';
import PropTypes from 'prop-types';
import {compose} from 'react-apollo';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import {Route, Switch, withRouter} from 'react-router';
import {AppLayout} from '@jahia/layouts';
import {registry} from '@jahia/registry';

export class AppLayoutContainer extends React.Component {
    render() {
        let routes = registry.find({type: 'route', target: 'cmm'});
        const {dxContext, siteKey, t} = this.props;

        return (
            <AppLayout
                leftNavigationProps={{
                    context: {
                        path: '/sites/' + siteKey
                    },
                    actionsTarget: 'leftMenuActions',
                    secondaryActionsTarget: 'leftMenuBottomActions'
                }}
            >
                <Switch>
                    {routes.map(r =>
                        <Route key={r.key} path={r.path} render={props => r.render(props, {dxContext, t})}/>
                    )}
                </Switch>
            </AppLayout>
        );
    }
}

const mapStateToProps = state => ({
    siteKey: state.site
});

AppLayoutContainer.propTypes = {
    dxContext: PropTypes.object.isRequired,
    siteKey: PropTypes.string.isRequired,
    t: PropTypes.func.isRequired
};

export default compose(
    withRouter,
    translate(),
    connect(mapStateToProps, null),
)(AppLayoutContainer);
