import React from 'react';
import {TreeView} from '@jahia/moonstone';
import {useDispatch, useSelector} from 'react-redux';
import {cmGoto} from '../JContent.redux';
import {useAdminRouteTreeStructure} from '../../utils/useAdminRouteTreeStructure';
import {useHistory} from 'react-router';
import {useNodeInfo} from '@jahia/data-helper';
import {useTranslation} from 'react-i18next';

const AdditionalApps = () => {
    const site = useSelector(state => state.site);
    const dispatch = useDispatch();
    const {t} = useTranslation();
    const history = useHistory();

    let selected = history.location.pathname.split('/').pop();

    const {tree, defaultOpenedItems, requiredPermissions} = useAdminRouteTreeStructure('jcontent', selected);
    const {node, loading, error} = useNodeInfo({path: '/sites/' + site}, {getPermissions: requiredPermissions});

    if (loading || error) {
        return false;
    }

    const data = tree
        .filter(route => route.requiredPermission === undefined || node[route.requiredPermission] !== false)
        .map(route => ({
            id: route.key,
            label: t(route.label),
            isSelectable: route.isSelectable,
            iconStart: route.icon
        }))
        .data;

    if (tree && tree.length !== 0) {
        return (
            <TreeView isReversed
                      data={data}
                      selectedItems={[selected]}
                      defaultOpenedItems={defaultOpenedItems}
                      onClickItem={app => app.isSelectable ? dispatch(cmGoto({mode: 'apps', path: '/' + app.id})) : false}/>
        );
    }

    return null;
};

export default AdditionalApps;
