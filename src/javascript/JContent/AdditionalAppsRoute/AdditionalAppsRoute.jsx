import {useSelector} from 'react-redux';
import {useAdminRouteTreeStructure, RouteWithTitle} from '@jahia/jahia-ui-root';
import {useNodeInfo} from '@jahia/data-helper';
import {Switch} from 'react-router';
import React from 'react';
import PropTypes from 'prop-types';
import {Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import styles from './AdditionAppsRoute.scss';
import {getTitle} from '../JContent.utils';

export const AdditionalAppsRoute = ({match, target}) => {
    const site = useSelector(state => state.site);
    const {t} = useTranslation('jcontent');

    const {routes: adminRoutes, allPermissions} = useAdminRouteTreeStructure(target);
    const {node} = useNodeInfo({path: '/sites/' + site}, {
        getPermissions: allPermissions,
        getSiteInstalledModules: true
    });

    const filteredAdminRoutes = adminRoutes && adminRoutes
        .filter(route => route.requiredPermission === undefined || (node && (node[route.requiredPermission] !== false)))
        .filter(route => route.isSelectable && route.render)
        .filter(route =>
            route.requireModuleInstalledOnSite === undefined ||
            (node && node.site.installedModulesWithAllDependencies.indexOf(route.requireModuleInstalledOnSite) !== -1)
        );

    return (
        <Switch>
            {filteredAdminRoutes && filteredAdminRoutes.map(r =>
                <RouteWithTitle key={r.key} routeTitle={getTitle(t, r)} path={`${match.path}/${r.key}`} render={props => r.render(props)}/>
            )}
            <RouteWithTitle key="nothingToDisplayRoute"
                            routeTitle={t('label.contentManager.navigation.apps.404')}
                            path={match.path}
                            render={() => <Typography variant="heading" weight="bold" className={styles.heading}>{t('label.contentManager.navigation.apps.404')}</Typography>}
            />
        </Switch>
    );
};

AdditionalAppsRoute.propTypes = {
    target: PropTypes.string.isRequired,
    match: PropTypes.object.isRequired
};
