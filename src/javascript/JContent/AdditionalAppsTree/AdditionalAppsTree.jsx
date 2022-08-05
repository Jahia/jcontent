import React, {useEffect} from 'react';
import {TreeView} from '@jahia/moonstone';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {cmGoto} from '../JContent.redux';
import {useAdminRouteTreeStructure} from '@jahia/jahia-ui-root';
import {useNodeInfo} from '@jahia/data-helper';
import {useTranslation} from 'react-i18next';
import PropTypes from 'prop-types';

export const AdditionalAppsTree = ({item, target}) => {
    const {site, path} = useSelector(state => ({site: state.site, path: state.jcontent.path}), shallowEqual);
    const dispatch = useDispatch();
    const {t} = useTranslation();

    const selected = path.substr(1);

    const {tree, routes, defaultOpenedItems, allPermissions} = useAdminRouteTreeStructure(target, selected);

    const {node, loading, error} = useNodeInfo({path: '/sites/' + site}, {
        getPermissions: allPermissions,
        getSiteInstalledModules: true
    });

    let switchSelection;
    if (!loading && !error && selected === '') {
        const firstItem = routes.find(route => route.isSelectable &&
            (route.requiredPermission === undefined || node[route.requiredPermission] !== false) &&
            (route.requireModuleInstalledOnSite === undefined || node.site.installedModulesWithAllDependencies.indexOf(route.requireModuleInstalledOnSite) > -1)
        );
        if (firstItem) {
            switchSelection = firstItem.key;
        }
    }

    useEffect(() => {
        if (switchSelection) {
            dispatch(cmGoto({path: '/' + switchSelection}));
        }
    }, [dispatch, switchSelection]);

    if (loading || error || switchSelection) {
        return false;
    }

    const data = tree
        .filter(route => route.requiredPermission === undefined || node[route.requiredPermission] !== false)
        .filter(route => route.requireModuleInstalledOnSite === undefined || node.site.installedModulesWithAllDependencies.indexOf(route.requireModuleInstalledOnSite) > -1)
        .map(route => ({
            id: route.key,
            label: t(route.label),
            isSelectable: route.isSelectable,
            iconStart: route.icon,
            treeItemProps: {
                'data-sel-role': route.key
            }
        }))
        .getData();

    if (selected && tree && tree.length !== 0) {
        return (
            <TreeView isReversed
                      data={data}
                      selectedItems={[selected]}
                      defaultOpenedItems={defaultOpenedItems}
                      onClickItem={(app, event, toggleNode) => app.isSelectable ?
                        dispatch(cmGoto({mode: item.key, path: '/' + app.id})) :
                        toggleNode(event)}/>
        );
    }

    return false;
};

AdditionalAppsTree.propTypes = {
    target: PropTypes.string.isRequired,
    item: PropTypes.object.isRequired
};
