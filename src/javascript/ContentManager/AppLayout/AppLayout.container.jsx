import React from 'react';
import PropTypes from 'prop-types';
import {compose} from 'react-apollo';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {Route, Switch, withRouter} from 'react-router';
import {AppLayout} from '@jahia/design-system-kit';
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
                    secondaryActionsTarget: 'leftMenuBottomActions',
                    burgerIconTitle: t('content-media-manager:label.burgerMenuTitle')
                }}
            >
                <Switch>
                    {routes.map(r => (
                        <Route key={r.key}
                               path={r.path}
                               render={props => {
                            let render1 = r.render(props, {dxContext, t});
                            if (render1 !== undefined) {
return render1;
}

                                console.log(`error while rendering ${r.key}`, r, props, dxContext);
                                return <h2 style={{color: 'red'}}>Error while rendering route {r.key}</h2>;
                        }}/>
                      )
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
    withTranslation(),
    connect(mapStateToProps, null)
)(AppLayoutContainer);
