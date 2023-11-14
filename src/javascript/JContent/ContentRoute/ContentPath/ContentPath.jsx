import React, {useMemo} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useQuery} from '@apollo/client';

import {cmGoto} from '~/JContent/redux/JContent.redux';
import {GetContentPath} from './ContentPath.gql-queries';
import {NonDisplayableNodeDialog} from '../../NavigationDialogs/NonDisplayableNodeDialog';
import PropTypes from 'prop-types';
import JContentConstants from '~/JContent/JContent.constants';
import {registry} from '@jahia/ui-extender';
import {Breadcrumb} from '@jahia/moonstone';
import SimplePathEntry from './SimplePathEntry';
import CompositePathEntry from './CompositePathEntry';
import {useNodeDialog} from '~/JContent/NavigationDialogs';

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

const renderItems = (items, onItemClick) => {
    if (items.length > 3) {
        const [first, last, others] = [items[0], items[items.length - 1], items.slice(1, items.length - 1)];
        return [
            <SimplePathEntry key={first.uuid} item={first} onItemClick={onItemClick}/>,
            <CompositePathEntry key={`${first.uuid}-${last.uuid}`} items={others} onItemClick={onItemClick}/>,
            <SimplePathEntry key={last.uuid} item={last} onItemClick={onItemClick}/>
        ];
    }

    return items.map(item => <SimplePathEntry key={item.uuid} item={item} onItemClick={onItemClick}/>);
};

export const ContentPath = ({selector}) => {
    const dispatch = useDispatch();
    const {openDialog, ...dialogProps} = useNodeDialog();

    const {mode, language, path, viewMode} = useSelector(selector, shallowEqual);
    const accordion = registry.get('accordionItem', mode);

    const {data, error} = useQuery(GetContentPath, {
        variables: {path, language, types: accordion?.treeConfig?.openableTypes}
    });

    const handleNavigation = item => {
        if (!item.isNodeType && viewMode === JContentConstants.tableView.viewMode.PAGE_BUILDER) {
            openDialog(item);
        } else {
            dispatch(cmGoto({path: item.path, params: {sub: false}}));
        }
    };

    if (error) {
        console.log(error);
    }

    const items = useMemo(() => getItems((data?.jcr?.node || {})), [data?.jcr?.node]);
    return (
        <>
            {(items.length > 0) && (
                <Breadcrumb>
                    {renderItems(items, handleNavigation)}
                </Breadcrumb>
            )}
            <NonDisplayableNodeDialog {...dialogProps} parentPage={items[0]?.isNodeType && items[0]} setPathAction={(path, params) => cmGoto({path, params})}/>
        </>
    );
};

ContentPath.propTypes = {
    selector: PropTypes.func
};

ContentPath.defaultProps = {
    selector: state => ({
        mode: state.jcontent.mode,
        viewMode: state.jcontent.tableView.viewMode,
        path: state.jcontent.path,
        language: state.language
    })
};

