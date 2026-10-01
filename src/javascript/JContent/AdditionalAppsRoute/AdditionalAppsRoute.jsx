import {useDispatch, useSelector} from 'react-redux';
import {useAdminRouteTreeStructure, RouteWithTitle} from '@jahia/jahia-ui-root';
import {useNodeInfo} from '@jahia/data-helper';
import {Route, Switch} from 'react-router';
import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import styles from './AdditionAppsRoute.scss';
import {getTitle} from '../JContent.utils';
import {cmGoto} from '../redux/JContent.redux';

const RedirectToFirstApp = ({mode, appKey}) => {
    const dispatch = useDispatch();

    useEffect(() => {
        // Replace, not push: Back from the app must leave the section, not land on /apps and redirect forward again
        dispatch(cmGoto({mode, path: '/' + appKey}, {replace: true}));
    }, [dispatch, mode, appKey]);

    return null;
};

RedirectToFirstApp.propTypes = {
    mode: PropTypes.string.isRequired,
    appKey: PropTypes.string.isRequired
};

export const AdditionalAppsRoute = ({match, target, mode}) => {
    const site = useSelector(state => state.site);
    const {t} = useTranslation('jcontent');

    const {routes: adminRoutes, allPermissions} = useAdminRouteTreeStructure(target);
    const {node, loading, error} = useNodeInfo({path: '/sites/' + site}, {
        getPermissions: allPermissions,
        getSiteInstalledModules: true
    });

    // Until the site permissions are known, every permission-gated app would be filtered out and the
    // requested app would fall through to "App not found", including on a URL that already names it
    if (loading) {
        return null;
    }

    if (error) {
        return (
            <Typography variant="heading" weight="bold" className={styles.heading}>
                {t('label.contentManager.error.queryingContent', {details: error.message})}
            </Typography>
        );
    }

    const filteredAdminRoutes = adminRoutes
        .filter(route => route.requiredPermission === undefined || node[route.requiredPermission] !== false)
        .filter(route => route.isSelectable && route.render)
        .filter(route =>
            route.requireModuleInstalledOnSite === undefined ||
            node.site.installedModulesWithAllDependencies.indexOf(route.requireModuleInstalledOnSite) !== -1
        );

    const firstApp = filteredAdminRoutes[0];

    return (
        <Switch>
            {filteredAdminRoutes.map(r =>
                <RouteWithTitle key={r.key} routeTitle={getTitle(t, r)} path={`${match.path}/${r.key}`} render={props => r.render(props)}/>
            )}
            {firstApp && (
                <Route key="firstAppRoute"
                       exact
                       path={match.path}
                       render={() => <RedirectToFirstApp mode={mode} appKey={firstApp.key}/>}
                />
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
    mode: PropTypes.string.isRequired,
    match: PropTypes.object.isRequired
};
