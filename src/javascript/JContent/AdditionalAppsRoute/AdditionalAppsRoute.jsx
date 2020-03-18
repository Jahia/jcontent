import {useSelector} from 'react-redux';
import {useAdminRouteTreeStructure} from '@jahia/ui-extender';
import {useNodeInfo} from '@jahia/data-helper';
import {Route} from 'react-router';
import React from 'react';
import PropTypes from 'prop-types';

export const AdditionalAppsRoute = ({match, target}) => {
    const site = useSelector(state => state.site);

    const {routes: adminRoutes, allPermissions} = useAdminRouteTreeStructure(target);
    const {node} = useNodeInfo({path: '/sites/' + site}, {getPermissions: allPermissions});

    const filteredAdminRoutes = adminRoutes && adminRoutes
        .filter(route => route.requiredPermission === undefined || (node && (node[route.requiredPermission] !== false)))
        .filter(route => route.isSelectable && route.render);

    return (
        <>
            {filteredAdminRoutes && filteredAdminRoutes.map(r =>
                <Route key={r.key} path={match.path + '/' + r.key} render={props => r.render(props)}/>
            )}
        </>
    );
};

AdditionalAppsRoute.propTypes = {
    target: PropTypes.string.isRequired,
    match: PropTypes.object.isRequired
};
