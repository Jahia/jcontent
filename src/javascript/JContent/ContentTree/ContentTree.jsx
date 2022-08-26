import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {displayName, lockInfo, useTreeEntries} from '@jahia/data-helper';
import {PickerItemsFragment} from './ContentTree.gql-fragments';
import {TreeView} from '@jahia/moonstone';
import {ContextualMenu} from '@jahia/ui-extender';
import {convertPathsToTree} from './ContentTree.utils';
import {refetchTypes, setRefetcher, unsetRefetcher} from '../JContent.refetches';
import {SORT_CONTENT_TREE_BY_NAME_ASC} from './ContentTree.constants';
import {cmClosePaths, cmGoto, cmOpenPaths} from '~/JContent/JContent.redux';
import {arrayValue, booleanValue} from '~/JContent/JContent.utils';

export const ContentTree = ({setPathAction, openPathAction, closePathAction, item, selector, refetcherType, isReversed, contextualMenuAction}) => {
    const dispatch = useDispatch();
    const {lang, siteKey, path, openPaths} = useSelector(selector, shallowEqual);
    const rootPath = '/sites/' + siteKey + item.config.rootPath;

    if (openPaths && openPaths.findIndex(p => p === rootPath) === -1) {
        openPaths.push(rootPath);
    }

    const useTreeEntriesOptionsJson = {
        fragments: [PickerItemsFragment.mixinTypes, PickerItemsFragment.primaryNodeType, PickerItemsFragment.isPublished, lockInfo, displayName],
        rootPaths: [rootPath],
        openPaths: openPaths,
        selectedPaths: [path],
        openableTypes: arrayValue(item.config.openableTypes),
        selectableTypes: arrayValue(item.config.selectableTypes),
        queryVariables: {language: lang},
        hideRoot: booleanValue(item.config.hideRoot)
    };

    // For pages portion want to skip the sortBy
    if (item.key !== 'pages') {
        useTreeEntriesOptionsJson.sortBy = SORT_CONTENT_TREE_BY_NAME_ASC;
    }

    const {treeEntries, refetch} = useTreeEntries(useTreeEntriesOptionsJson);

    let switchPath;
    // If path is root one but root is hidden, then select its first child
    if (((path === rootPath) || (path === rootPath + '/')) && item.config.hideRoot && treeEntries.length > 0) {
        const first = treeEntries[0];
        first.selected = true;
        switchPath = first.path;
    }

    useEffect(() => {
        if (switchPath) {
            dispatch(setPathAction(switchPath));
        }
    }, [dispatch, setPathAction, switchPath]);

    useEffect(() => {
        setRefetcher(refetcherType, {
            refetch: refetch
        });
        return () => {
            unsetRefetcher(refetcherType);
        };
    });

    let contextualMenu = useRef();

    return (
        <React.Fragment>
            {contextualMenuAction && <ContextualMenu setOpenRef={contextualMenu} actionKey={contextualMenuAction}/>}
            <TreeView isReversed={isReversed}
                      data={convertPathsToTree(treeEntries, path, isReversed, contextualMenuAction)}
                      openedItems={openPaths}
                      selectedItems={[path]}
                      onContextMenuItem={(object, event) => {
                          event.stopPropagation();
                          contextualMenu.current(event, {path: object.id});
                      }}
                      onClickItem={object => dispatch(setPathAction(object.id, {sub: false}))}
                      onOpenItem={object => dispatch(openPathAction(object.id))}
                      onCloseItem={object => dispatch(closePathAction(object.id))}
            />
        </React.Fragment>
    );
};

export const accordionPropType = PropTypes.shape({
    key: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
    label: PropTypes.string.isRequired,
    defaultPath: PropTypes.func,
    requiredSitePermission: PropTypes.string.isRequired,
    config: PropTypes.shape({
        hideRoot: PropTypes.bool,
        rootPath: PropTypes.node.isRequired,
        selectableTypes: PropTypes.arrayOf(PropTypes.string),
        type: PropTypes.string.isRequired,
        openableTypes: PropTypes.arrayOf(PropTypes.string),
        rootLabel: PropTypes.string
    }).isRequired
});

ContentTree.propTypes = {
    item: accordionPropType,
    selector: PropTypes.func,
    refetcherType: PropTypes.string,
    // These functions must return redux action object
    openPathAction: PropTypes.func,
    closePathAction: PropTypes.func,
    setPathAction: PropTypes.func,
    isReversed: PropTypes.bool,
    contextualMenuAction: PropTypes.string
};

ContentTree.defaultProps = {
    selector: state => ({
        siteKey: state.site,
        lang: state.language,
        path: state.jcontent.path,
        openPaths: state.jcontent.openPaths
    }),
    refetcherType: refetchTypes.CONTENT_TREE,
    setPathAction: (path, params) => cmGoto({path, params}),
    openPathAction: path => cmOpenPaths([path]),
    closePathAction: path => cmClosePaths([path]),
    isReversed: true
};

export default ContentTree;
