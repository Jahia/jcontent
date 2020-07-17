import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import {useDispatch, useSelector} from 'react-redux';
import {useQuery} from '@apollo/react-hooks';

import {cmGoto} from '~/JContent/JContent.redux';
import {GetContentPath} from './ContentPath.gql-queries';
import ContentPath from './ContentPath';
import JContentConstants from '../../../JContent.constants';

function findLastIndex(array, callback) {
    let lastIndex = -1;
    array.forEach((e, i) => {
        if (callback(e)) {
            lastIndex = i;
        }
    });
    return lastIndex;
}

function getItems(externalPath, node = {}) {
    const ancestors = node.ancestors || [];

    if (ancestors.length === 0 || node.isVisibleInContentTree || externalPath) {
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

const ContentPathContainer = ({externalPath}) => {
    const dispatch = useDispatch();

    const {mode, language, path} = useSelector(state => ({
        mode: state.jcontent.mode,
        path: state.jcontent.path,
        language: state.language
    }));

    const {data, error} = useQuery(GetContentPath, {
        variables: {
            path: externalPath || path,
            language
        }
    });

    const handleNavigation = path => {
        dispatch(cmGoto({
            mode: mode || JContentConstants.mode.CONTENT_FOLDERS,
            path
        }));
    };

    if (error) {
        console.log(error);
    }

    const node = data?.jcr?.node || {};
    const items = useMemo(() => getItems(externalPath, node), [node, externalPath]);
    return <ContentPath items={items} onItemClick={handleNavigation}/>;
};

ContentPathContainer.defaultProps = {
    externalPath: undefined
};

ContentPathContainer.propTypes = {
    externalPath: PropTypes.string
};

export default ContentPathContainer;
