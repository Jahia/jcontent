import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {LayoutModule} from '@jahia/moonstone';
import ContentNavigation from './ContentNavigation';
import {Route, Switch} from 'react-router';
import {registry} from '@jahia/ui-extender';
import {useAdminRouteTreeStructure} from '../../utils/useAdminRouteTreeStructure';
import {useSelector} from 'react-redux';
import {useNodeInfo} from '@jahia/data-helper';

const AppLayout = ({dxContext}) => {
    const routes = registry.find({type: 'route', target: 'jcontent'});

    const site = useSelector(state => state.site);

    const {routes: adminRoutes, requiredPermissions} = useAdminRouteTreeStructure('jcontent');
    const {node} = useNodeInfo({path: '/sites/' + site}, {getPermissions: requiredPermissions});

    const filteredAdminRoutes = adminRoutes && adminRoutes
        .filter(route => route.requiredPermission === undefined || (node && (node[route.requiredPermission] !== false)))
        .filter(route => route.isSelectable && route.render);

    const {t} = useTranslation('jcontent');
    return (
        <LayoutModule
            navigation={<ContentNavigation/>}
            content={
                <Switch>
                    {filteredAdminRoutes && filteredAdminRoutes.map(r =>
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
