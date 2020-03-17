import React from 'react';
import {TreeView} from '@jahia/moonstone';
import {useDispatch, useSelector} from 'react-redux';
import {cmGoto} from '../JContent.redux';
import {useAdminRouteTreeStructure} from './useAdminRouteTreeStructure';

const AdditionnalApps = () => {
    const site = useSelector(state => state.site);
    const dispatch = useDispatch();
    const {tree, selectedItem, defaultOpenedItems, loading, error} = useAdminRouteTreeStructure('jcontent', '/sites/' + site);

    if (loading || error) {
        return false;
    }

    if (tree && tree.length !== 0) {
        return (
            <TreeView isReversed
                      data={tree}
                      selectedItems={[selectedItem]}
                      defaultOpenedItems={defaultOpenedItems}
                      onClickItem={app => app.isSelectable ? dispatch(cmGoto({mode: 'apps', path: '/' + app.id})) : false}/>
        );
    }

    return null;
};

export default AdditionnalApps;
