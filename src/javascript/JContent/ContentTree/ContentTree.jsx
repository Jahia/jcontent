import React, {useEffect, useRef, useCallback} from 'react';
import PropTypes from 'prop-types';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {displayName, lockInfo, useNodeInfo, useTreeEntries} from '@jahia/data-helper';
import {PickerItemsFragment} from './ContentTree.gql-fragments';
import {TreeView} from '@jahia/moonstone';
import {ContextualMenu} from '@jahia/ui-extender';
import {convertPathsToTree} from './ContentTree.utils';
import {refetchTypes, setRefetcher, unsetRefetcher} from '../JContent.refetches';
import {cmClosePaths, cmGoto, cmOpenPaths} from '~/JContent/redux/JContent.redux';
import {arrayValue, booleanValue} from '~/JContent/JContent.utils';
import clsx from 'clsx';
import {useNodeDrop} from '~/JContent/dnd/useNodeDrop';
import {useNodeDrag} from '~/JContent/dnd/useNodeDrag';
import {useFileDrop} from '~/JContent/dnd/useFileDrop';
import JContentConstants from '~/JContent/JContent.constants';
import {LinkDialog, useNodeDialog} from '~/JContent/NavigationDialogs';
import {useTranslation} from 'react-i18next';
import {useVirtualizer} from '@tanstack/react-virtual';

export const accordionPropType = PropTypes.shape({
    key: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
    label: PropTypes.string.isRequired,
    getRootPath: PropTypes.func,
    requiredSitePermission: PropTypes.string.isRequired,
    requireModuleInstalledOnSite: PropTypes.string,
    treeConfig: PropTypes.shape({
        hideRoot: PropTypes.bool,
        selectableTypes: PropTypes.arrayOf(PropTypes.string),
        openableTypes: PropTypes.arrayOf(PropTypes.string),
        rootLabel: PropTypes.string,
        sortBy: PropTypes.shape({
            fieldName: PropTypes.string,
            sortType: PropTypes.string
        }),
        dnd: PropTypes.shape({
            canDrag: PropTypes.bool,
            canDrop: PropTypes.bool,
            canDropFile: PropTypes.bool,
            canReorder: PropTypes.bool
        }),
        showContextMenuOnRootPath: PropTypes.bool
    }).isRequired
});

const ItemComponent = ({children, node, item, treeEntries, virtualizer, virtualRow, ...props}) => {
    const ref = useRef(null);
    const [{isCanDrop, insertPosition, destParent}, drop] = useNodeDrop({
        dropTarget: node,
        orderable: item.treeConfig.dnd && booleanValue(item.treeConfig.dnd?.canReorder),
        entries: treeEntries,
        refetchQueries: ['PickerQuery__DisplayName_LockInfo_MixinTypes_ParentNodeWithName_PickerPrimaryNodeTypeName_PublicationStatus']
    });
    const [{isCanDrop: isCanDropFile}, dropFile] = useFileDrop({
        uploadType: node.primaryNodeType.name === 'jnt:folder' && JContentConstants.mode.UPLOAD,
        uploadPath: node.path
    });
    const [{dragging}, drag] = useNodeDrag({dragSource: node});

    if (item.treeConfig.dnd && booleanValue(item.treeConfig.dnd?.canDrop)) {
        drop(ref);
    }

    if (item.treeConfig.dnd && booleanValue(item.treeConfig.dnd?.canDropFile)) {
        dropFile(ref);
    }

    if (item.treeConfig.dnd && booleanValue(item.treeConfig.dnd?.canDrag)) {
        drag(ref);
    }

    const depth = (isCanDrop || isCanDropFile) ? treeEntries.find(e => e.node.path === destParent.path)?.depth : -1;

    useEffect(() => {
        if (ref.current && depth > 0) {
            ref.current.style.setProperty('--depth', depth);
        }
    }, [depth]);

    useEffect(() => {
        if (ref.current) {
            virtualizer.measureElement(ref.current);
        }
    }, [ref, virtualizer]);

    return (
        <li ref={ref}
            data-index={virtualRow.index}
            {...props}
            className={clsx([
                    {
                        'moonstone-drag': dragging,
                        'moonstone-drop_listItem': (isCanDrop || isCanDropFile) && !insertPosition,
                        'moonstone-order_before': isCanDrop && insertPosition === 'insertBefore',
                        'moonstone-order_after': isCanDrop && insertPosition === 'insertAfter'
                    }
                ])}
        >
            {children}
        </li>
    );
};

ItemComponent.propTypes = {
    item: accordionPropType,
    children: PropTypes.node,
    node: PropTypes.object,
    treeEntries: PropTypes.array,
    virtualizer: PropTypes.object,
    virtualRow: PropTypes.object
};

const TREE_ITEM_SIZE = 32;

// eslint-disable-next-line complexity
export const ContentTree = ({setPathAction, openPathAction, closePathAction, item, selector, refetcherType, isReversed, contextualMenuAction, pageTitlePrefix}) => { // NOSONAR
    const dispatch = useDispatch();
    const {t} = useTranslation('jcontent');
    const {lang, siteKey, path, openPaths, viewMode} = useSelector(selector, shallowEqual);
    const {openDialog: openLinkDialog, ...linkDialogProps} = useNodeDialog();
    const rootPath = item.getRootPath(siteKey);
    const ulRef = useRef(null);
    const ulScrollRef = useRef(0);
    const dataRef = useRef(null);
    const mainRef = useRef(null);

    if (openPaths && openPaths.findIndex(p => p === rootPath) === -1) {
        openPaths.push(rootPath);
    }

    // Use callback to be able to perform an action when ref is set
    const ulRefSet = useCallback(node => {
        if (node) {
            ulRef.current = node;
            node.parentElement.scrollTop = ulScrollRef.current;
        }
    }, []);

    const useTreeEntriesOptionsJson = {
        fragments: [PickerItemsFragment.mixinTypes, PickerItemsFragment.primaryNodeType, PickerItemsFragment.isPublished, lockInfo, PickerItemsFragment.parentNode, displayName],
        rootPaths: [rootPath],
        openPaths: openPaths,
        selectedPaths: [path],
        openableTypes: arrayValue(item.treeConfig.openableTypes) || [],
        selectableTypes: arrayValue(item.treeConfig.selectableTypes) || [],
        queryVariables: {language: lang},
        hideRoot: booleanValue(item.treeConfig.hideRoot),
        sortBy: item.treeConfig.sortBy
    };

    const nodeInfo = useNodeInfo({path}, {getParent: true});
    const {treeEntries, refetch, loading} = useTreeEntries(useTreeEntriesOptionsJson, {errorPolicy: 'all'});

    if (dataRef.current === null || treeEntries.length > 0) {
        dataRef.current = treeEntries;
    }

    let switchPath;
    // If path is root one but root is hidden, then select its first child
    if (((path === rootPath) || (path === rootPath + '/')) && item.treeConfig.hideRoot && treeEntries.length > 0) {
        const first = treeEntries.find(entry => entry.path.startsWith(`/sites/${siteKey}`));
        if (first) {
            first.selected = true;
            switchPath = first.path;
        }
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

    const rowVirtualizer = useVirtualizer({
        count: dataRef?.current?.length,
        estimateSize: () => TREE_ITEM_SIZE,
        getScrollElement: () => mainRef.current,
        measureElement:
            typeof window !== 'undefined' &&
            navigator.userAgent.indexOf('Firefox') === -1 ?
                element => element?.getBoundingClientRect().height :
                undefined,
        overscan: 10
    });

    const contextualMenu = useRef();
    const rootContextualMenu = useRef();

    const highlightedItem = path && (!treeEntries.find(f => f.path === path)) && treeEntries.filter(f => path.startsWith(f.path)).slice(-1)[0];
    const highlighted = highlightedItem ? [highlightedItem.path] : [];
    if (!nodeInfo.loading && !nodeInfo.node && highlightedItem?.path) {
        dispatch((setPathAction(highlightedItem.path)));
    }

    if (!nodeInfo.loading && nodeInfo.node && nodeInfo.node?.displayName) {
        window.top.document.title = `${t(pageTitlePrefix)} - ${nodeInfo.node.displayName}`;
    }

    const rows = rowVirtualizer.getVirtualItems();

    const data = convertPathsToTree({
        treeEntries: rows ? rows.map(row => ({...dataRef.current[row.index], virtualRow: row})) : [],
        selected: path,
        isReversed,
        contentMenu: contextualMenuAction,
        itemProps: {item},
        viewMode: viewMode,
        virtualizer: rowVirtualizer,
        loading,
        openPaths
    });

    return (
        <React.Fragment>
            {contextualMenuAction && <ContextualMenu setOpenRef={contextualMenu} actionKey={contextualMenuAction}/>}
            {item.treeConfig.showContextMenuOnRootPath && <ContextualMenu setOpenRef={rootContextualMenu} actionKey="rootContentMenu"/>}
            <div ref={mainRef}
                 data-cm-role="navtree-holder"
                 style={{height: '100%', overflow: 'auto'}}
                 onContextMenu={event => {
                    event.stopPropagation();
                    if (item.treeConfig.showContextMenuOnRootPath) {
                        rootContextualMenu.current(event, {path: rootPath});
                    }
                }}
            >
                <TreeView ref={ulRefSet}
                          isPadVirtualizedRow
                          isReversed={isReversed}
                          itemComponent={ItemComponent}
                          style={{
                              height: `${rowVirtualizer.getTotalSize()}px`, // Tells scrollbar how big the table is
                              position: 'relative' // Needed for absolute positioning of rows
                          }}
                          data={data}
                          openedItems={openPaths}
                          highlightedItems={highlighted}
                          selectedItems={[path.endsWith('/') ? path.slice(0, -1) : path]}
                          onContextMenuItem={(object, event) => {
                              event.stopPropagation();
                              if (contextualMenuAction) {
                                  contextualMenu.current(event, {path: object.id});
                              }
                          }}
                          onClickItem={object => {
                              if (object.isSelectable) {
                                  const {node} = object.treeItemProps;
                                  if (['jnt:externalLink', 'jnt:nodeLink'].includes(node.primaryNodeType.name)) {
                                      openLinkDialog(node);
                                  } else {
                                      dispatch(setPathAction(object.id, {sub: false}));
                                  }
                              }
                          }}
                          onOpenItem={object => {
                              // Record scroll position of tree container
                              ulScrollRef.current = ulRef.current?.parentElement.scrollTop;
                              dispatch(openPathAction(object.id));
                          }}
                          onCloseItem={object => dispatch(closePathAction(object.id))}
                />
            </div>
            <LinkDialog {...linkDialogProps}/>
        </React.Fragment>
    );
};

ContentTree.propTypes = {
    item: accordionPropType,
    selector: PropTypes.func,
    refetcherType: PropTypes.string,
    // These functions must return redux action object
    openPathAction: PropTypes.func,
    closePathAction: PropTypes.func,
    setPathAction: PropTypes.func,
    isReversed: PropTypes.bool,
    contextualMenuAction: PropTypes.string,
    pageTitlePrefix: PropTypes.string
};

ContentTree.defaultProps = {
    selector: state => ({
        siteKey: state.site,
        lang: state.language,
        path: state.jcontent.path,
        openPaths: state.jcontent.openPaths,
        viewMode: state.jcontent.tableView.viewMode
    }),
    refetcherType: refetchTypes.CONTENT_TREE,
    setPathAction: (path, params) => cmGoto({path, params}),
    openPathAction: path => cmOpenPaths([path]),
    closePathAction: path => cmClosePaths([path]),
    isReversed: true,
    pageTitlePrefix: 'jContent'
};

export default ContentTree;
