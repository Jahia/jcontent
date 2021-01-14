import {useSelector} from 'react-redux';
import {useAdminRouteTreeStructure} from '@jahia/jahia-ui-root';
import {useNodeInfo} from '@jahia/data-helper';
import {Route, Switch} from 'react-router';
import React from 'react';
import PropTypes from 'prop-types';
import {Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import styles from './AdditionAppsRoute.scss';

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
        .filter(route => route.requireModuleInstalledOnSite === undefined || (node && node.site.installedModulesWithAllDependencies.indexOf(route.requireModuleInstalledOnSite) !== -1));

    return (
        <Switch>
            {filteredAdminRoutes && filteredAdminRoutes.map(r =>
                <Route key={r.key} path={match.path + '/' + r.key} render={props => r.render(props)}/>
            )}
            <Route key="nothingToDisplayRoute"
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
