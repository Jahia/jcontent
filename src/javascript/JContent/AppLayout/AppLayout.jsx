import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {LayoutModule} from '@jahia/moonstone';
import ContentNavigation from './ContentNavigation';
import {Route, Switch} from 'react-router';
import {registry} from '@jahia/ui-extender';
import {useAdminRouteTreeStructure} from '../AdditionnalApps/useAdminRouteTreeStructure';
import {useSelector} from 'react-redux';

const AppLayout = ({dxContext}) => {
    const routes = registry.find({type: 'route', target: 'jcontent'});

    const site = useSelector(state => state.site);
    const {routes: adminRoutes} = useAdminRouteTreeStructure('jcontent', '/sites/' + site);

    const {t} = useTranslation('jcontent');
    return (
        <LayoutModule
            navigation={<ContentNavigation/>}
            content={
                <Switch>
                    {adminRoutes && adminRoutes.filter(route => route.isSelectable && route.render).map(r =>
                        <Route key={r.key} path={'/jcontent/:siteKey/:lang/apps/' + r.key} render={props => r.render(props, {dxContext, t})}/>
                    )}
                    {routes.map(r =>
                        <Route key={r.key} path={r.path} render={props => r.render(props, {dxContext, t})}/>
                        )}
                </Switch>
            }
        />
    );
};

AppLayout.propTypes = {
    dxContext: PropTypes.object.isRequired
};

export default AppLayout;
