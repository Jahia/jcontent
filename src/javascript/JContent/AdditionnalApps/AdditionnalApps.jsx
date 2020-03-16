import React from 'react';
import {TreeView} from '@jahia/moonstone';
import {registry} from '@jahia/ui-extender';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {useDispatch} from 'react-redux';
import {cmGoto} from '../JContent.redux';

const useAdminRouteTreeStructure = function (target, parent) {
    const history = useHistory();
    const {t} = useTranslation();
    const permissions = {};

    let selected = history.location.pathname.split('/').pop();
    let defaultOpened = [];

    const createTree = (target, parent) => registry.find({type: 'adminRoute', target, parent})
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

            treeEntry.children = createTree(target, route.key);

            return treeEntry;
        });

    let selectedItem = registry.get('adminRoute', selected);
    if (selectedItem) {
        while (selectedItem.parent) {
            selectedItem = registry.get('adminRoute', selectedItem.parent);
            defaultOpened.push(selectedItem.key);
        }
    }

    return {
        data: createTree(target, parent),
        selectedItems: [selected],
        defaultOpenedItems: defaultOpened
    };
};

const AdditionnalApps = () => {
    const dispatch = useDispatch();
    const {data, selectedItems, defaultOpenedItems} = useAdminRouteTreeStructure('jcontent');

    if (data && data.length !== 0) {
        return (
            <TreeView isReversed
                      data={data}
                      selectedItems={selectedItems}
                      defaultOpenedItems={defaultOpenedItems}
                      onClickItem={app => app.isSelectable ? dispatch(cmGoto({mode: 'apps', path: '/' + app.id})) : false}/>
        );
    }

    return null;
};

export default AdditionnalApps;
