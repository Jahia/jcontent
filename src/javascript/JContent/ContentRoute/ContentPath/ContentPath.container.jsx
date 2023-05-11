import React, {useMemo, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useQuery} from '@apollo/react-hooks';

import {cmGoto} from '~/JContent/redux/JContent.redux';
import {GetContentPath} from './ContentPath.gql-queries';
import ContentPath from './ContentPath';
import {ContentPathDialog} from './ContentPathDialog';
import {batchActions} from 'redux-batched-actions';
import {setTableViewMode} from '../../redux/tableView.redux';
import JContentConstants from '../../JContent.constants';

function findLastIndex(array, callback) {
    let lastIndex = -1;
    array.forEach((e, i) => {
        if (callback(e)) {
            lastIndex = i;
        }
    });
    return lastIndex;
}

function getItems(node = {}) {
    const ancestors = node.ancestors || [];

    if ((ancestors.length === 0) || node.isVisibleInContentTree) {
        return ancestors;
    }

    const indexOfLastAncestorInContentTree = findLastIndex(ancestors, a => a.isVisibleInContentTree);
    if (indexOfLastAncestorInContentTree > 0) {
        const lastAncestorInContentTree = ancestors[indexOfLastAncestorInContentTree];
        if (indexOfLastAncestorInContentTree + 1 === ancestors.length) {
            return [lastAncestorInContentTree];
        }

        const remainingAncestors = ancestors.slice(indexOfLastAncestorInContentTree + 1);
        return [lastAncestorInContentTree].concat(remainingAncestors);
    }

    return ancestors;
}

const ContentPathContainer = () => {
    const dispatch = useDispatch();
    const [currentItem, setCurrentItem] = useState(null);

    const {mode, language, path} = useSelector(state => ({
        mode: state.jcontent.mode,
        path: state.jcontent.path,
        language: state.language
    }), shallowEqual);

    const {data, error} = useQuery(GetContentPath, {
        variables: {path, language}
    });

    const handleNavigation = item => {
        if (item.primaryNodeType?.name === 'jnt:contentList') {
            setCurrentItem(item);
        } else {
            dispatch(cmGoto({mode, path: item.path}));
        }
    };

    if (error) {
        console.log(error);
    }

    const items = useMemo(() => getItems((data?.jcr?.node || {})), [data?.jcr?.node]);
    return (
        <>
            <ContentPath items={items} onItemClick={handleNavigation}/>
            <ContentPathDialog isOpen={currentItem}
                               handleParentPage={() => {
                                   dispatch(cmGoto({mode, path: currentItem.path.substring(0, currentItem.path.lastIndexOf('/'))}));
                                   setCurrentItem(null);
                               }}
                               handleClose={() => setCurrentItem(null)}
                               handleListView={() => {
                                   dispatch(batchActions([setTableViewMode(JContentConstants.tableView.viewMode.FLAT), cmGoto({mode, path: currentItem.path})]));
                                   window.localStorage.setItem(JContentConstants.localStorageKeys.viewMode, JContentConstants.tableView.viewMode.FLAT);
                                   setCurrentItem(null);
                               }}
            />
        </>
    );
};

export default ContentPathContainer;
