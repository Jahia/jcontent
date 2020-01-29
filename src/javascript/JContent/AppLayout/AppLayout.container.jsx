import React from 'react';
import PropTypes from 'prop-types';
import {compose} from 'react-apollo';
import {withTranslation} from 'react-i18next';
import {LayoutModule, SecondaryNav} from '@jahia/moonstone';
import ContentNavigation from '../ContentNavigation';
import {Route, Switch, withRouter} from 'react-router';
import {registry} from '@jahia/ui-extender';
import SiteSwitcher from '../SiteSwitcher';
import SiteLanguageSwitcher from '../SiteLanguageSwitcher';
import JContentReversedLogo from '../ContentNavigation/jContentHeader';
import {withStyles} from '@material-ui/core';

const styles = () => ({
    logoContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    switchersContainer: {
        display: 'flex',
        margin: '20px'
    }
});

export class AppLayoutContainer extends React.Component {
    render() {
        const {classes} = this.props;
        let routes = registry.find({type: 'route', target: 'jcontent'});
        const {dxContext, t} = this.props;

        return (
            <LayoutModule navigation={
                <SecondaryNav header={
                    <div className={classes.logoContainer}>
                        <JContentReversedLogo/>
                        <div className={classes.switchersContainer}>
                            <SiteSwitcher/>
                            <SiteLanguageSwitcher/>
                        </div>
                    </div>
                }
                >
                    <ContentNavigation/>
                </SecondaryNav>
            }
                          content={
                              <Switch>
                                  {routes.map(r =>
                                      <Route key={r.key} path={r.path} render={props => r.render(props, {dxContext, t})}/>
                                  )}
                              </Switch>
                          }/>
        );
    }
}

AppLayoutContainer.propTypes = {
    classes: PropTypes.object,
    dxContext: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired
};

export default compose(
    withRouter,
    withTranslation(),
    withStyles(styles)
)(AppLayoutContainer);
