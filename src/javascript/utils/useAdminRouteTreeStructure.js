import {useMemo} from 'react';
import {registry} from '@jahia/ui-extender';
import {Tree} from './Tree';

export const useAdminRouteTreeStructure = function (target, selected) {
    let defaultOpened = [];

    const routes = useMemo(() => {
        const getAllRoutes = (baseTarget, parent = '') => registry.find({type: 'adminRoute', target: baseTarget + parent})
            .flatMap(route => {
                return [route, ...getAllRoutes(baseTarget, '-' + route.key)];
            });
        return getAllRoutes(target);
    });

    const requiredPermissions = useMemo(() => routes
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

    const createTree = (baseTarget, parent = '') => registry.find({type: 'adminRoute', target: baseTarget + parent})
        .filter(route => !route.omitFromTree)
        .map(route => ({
            ...route,
            children: createTree(baseTarget, '-' + route.key)
        }));

    if (selected) {
        let selectedItem = registry.get('adminRoute', selected);
        if (selectedItem) {
            while (selectedItem.parent) {
                selectedItem = registry.get('adminRoute', selectedItem.parent);
                defaultOpened.push(selectedItem.key);
            }
        }
    }

    return {
        tree: new Tree(createTree(target)),
        defaultOpenedItems: defaultOpened,
        routes,
        requiredPermissions
    };
};
