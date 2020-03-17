import {useMemo} from 'react';
import {useHistory} from 'react-router';
import {useTranslation} from 'react-i18next';
import {registry} from '@jahia/ui-extender';
import {useNodeInfo} from '@jahia/data-helper';

export const useAdminRouteTreeStructure = function (target, permissionsContextNodePath) {
    const history = useHistory();
    const {t} = useTranslation();

    let selected = history.location.pathname.split('/').pop();
    let defaultOpened = [];

    const allRoutes = useMemo(() => {
        const getAllRoutes = (baseTarget, parent = '') => registry.find({type: 'adminRoute', target: baseTarget + parent})
            .flatMap(route => {
                return [route, ...getAllRoutes(baseTarget, '-' + route.key)];
            });
        return getAllRoutes(target);
    });

    const requiredPermissions = useMemo(() => allRoutes
        .filter(route => !route.omitFromTree)
        .flatMap(route => {
            const permission = route.requiredPermission;
            if (permission) {
                if (Array.isArray(permission)) {
                    return permission;
                }

                return [permission];
            }

            return [];
        })
        .filter((item, pos, self) => self.indexOf(item) === pos)
    );

    const permissions = useNodeInfo({path: permissionsContextNodePath}, {getPermissions: requiredPermissions});

    if (permissions.loading || permissions.error) {
        return {
            loading: permissions.loading,
            error: permissions.error
        };
    }

    const createTree = (baseTarget, parent = '') => registry.find({type: 'adminRoute', target: baseTarget + parent})
        .filter(route => !route.omitFromTree)
        .filter(route => route.requiredPermission === undefined || permissions.node[route.requiredPermission] !== false)
        .map(route => {
            let treeEntry = {
                id: route.key,
                label: t(route.label),
                isSelectable: route.isSelectable
            };
            if (route.icon !== null) {
                treeEntry.iconStart = route.icon;
            }

            treeEntry.children = createTree(baseTarget, '-' + route.key);

            return treeEntry;
        });

    let selectedItem = registry.get('adminRoute', selected);
    if (selectedItem) {
        while (selectedItem.parent) {
            selectedItem = registry.get('adminRoute', selectedItem.parent);
            defaultOpened.push(selectedItem.key);
        }
    }

    const routes = allRoutes.filter(route => route.requiredPermission === undefined || permissions.node[route.requiredPermission] !== false);

    return {
        tree: createTree(target),
        selectedItem: selected,
        defaultOpenedItems: defaultOpened,
        routes: routes,
        loading: false
    };
};
