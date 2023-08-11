import React, {useMemo, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useQuery} from '@apollo/client';

import {cmGoto} from '~/JContent/redux/JContent.redux';
import {GetContentPath} from './ContentPath.gql-queries';
import ContentPath from './ContentPath';
import {ContentPathDialog} from './ContentPathDialog';
import PropTypes from 'prop-types';
import JContentConstants from '~/JContent/JContent.constants';

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

const ContentPathContainer = ({selector}) => {
    const dispatch = useDispatch();
    const [currentItem, setCurrentItem] = useState(null);

    const {mode, language, path, viewMode} = useSelector(selector, shallowEqual);

    const {data, error} = useQuery(GetContentPath, {
        variables: {path, language}
    });

    const handleNavigation = item => {
        if (item.primaryNodeType?.name === 'jnt:contentList' && mode === JContentConstants.mode.PAGES && viewMode === JContentConstants.tableView.viewMode.PAGE_BUILDER) {
            setCurrentItem(item);
        } else {
            dispatch(cmGoto({mode, path: item.path, params: {sub: false}}));
        }
    };

    if (error) {
        console.log(error);
    }

    const items = useMemo(() => getItems((data?.jcr?.node || {})), [data?.jcr?.node]);
    return (
        <>
            <ContentPath items={items} onItemClick={handleNavigation}/>
            <ContentPathDialog isOpen={Boolean(currentItem)}
                               handleParentNavigation={() => {
                                   dispatch(setPathAction(mode, currentItem.path.substring(0, currentItem.path.lastIndexOf('/'))));
                                   setCurrentItem(null);
                               }}
                               handleClose={() => setCurrentItem(null)}
                               handleListNavigation={() => {
                                   dispatch(setPathAction(mode, currentItem.path));
                                   setCurrentItem(null);
                               }}
            />
        </>
    );
};

ContentPathContainer.propTypes = {
    selector: PropTypes.func
};

ContentPathContainer.defaultProps = {
    selector: state => ({
        mode: state.jcontent.mode,
        viewMode: state.jcontent.tableView.viewMode,
        path: state.jcontent.path,
        language: state.language
    })
};

export default ContentPathContainer;
