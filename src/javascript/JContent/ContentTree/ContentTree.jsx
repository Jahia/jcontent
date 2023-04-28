import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {displayName, lockInfo, useTreeEntries} from '@jahia/data-helper';
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
import {LinkDialog, useLinkDialog} from '~/JContent/ContentTree/LinkDialog';

export const accordionPropType = PropTypes.shape({
    key: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
    label: PropTypes.string.isRequired,
    getRootPath: PropTypes.func,
    requiredSitePermission: PropTypes.string.isRequired,
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

const ItemComponent = ({children, node, item, treeEntries, ...props}) => {
    const ref = useRef(null);
    const [{isCanDrop, insertPosition, destParent}, drop] = useNodeDrop({
        dropTarget: node,
        orderable: item.treeConfig.dnd && booleanValue(item.treeConfig.dnd?.canReorder),
        entries: treeEntries,
        refetchQueries: ['PickerQuery__DisplayName_IsTreeSelectable_LockInfo_MixinTypes_ParentNodeWithName_PickerPrimaryNodeTypeName_PublicationStatus']
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

    return (
        <>
            <li ref={ref}
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
        </>
    );
};

ItemComponent.propTypes = {
    item: accordionPropType,
    children: PropTypes.node,
    node: PropTypes.object,
    treeEntries: PropTypes.array
};

export const ContentTree = ({setPathAction, openPathAction, closePathAction, item, selector, refetcherType, isReversed, contextualMenuAction}) => {
    const dispatch = useDispatch();
    const {lang, siteKey, path, openPaths} = useSelector(selector, shallowEqual);
    const {openLinkDialog, ...linkDialogProps} = useLinkDialog();
    const rootPath = item.getRootPath(siteKey);

    if (openPaths && openPaths.findIndex(p => p === rootPath) === -1) {
        openPaths.push(rootPath);
    }

    const useTreeEntriesOptionsJson = {
        fragments: [PickerItemsFragment.mixinTypes, PickerItemsFragment.primaryNodeType, PickerItemsFragment.isPublished, PickerItemsFragment.isTreeSelectable, lockInfo, PickerItemsFragment.parentNode, displayName],
        rootPaths: [rootPath],
        openPaths: openPaths,
        selectedPaths: [path],
        openableTypes: arrayValue(item.treeConfig.openableTypes),
        selectableTypes: arrayValue(item.treeConfig.selectableTypes),
        queryVariables: {language: lang},
        hideRoot: booleanValue(item.treeConfig.hideRoot),
        sortBy: item.treeConfig.sortBy
    };

    const {treeEntries, refetch} = useTreeEntries(useTreeEntriesOptionsJson, {errorPolicy: 'all'});

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

    let contextualMenu = useRef();

    return (
        <React.Fragment>
            {contextualMenuAction && <ContextualMenu setOpenRef={contextualMenu} actionKey={contextualMenuAction}/>}
            <TreeView isReversed={isReversed}
                      itemComponent={ItemComponent}
                      data={convertPathsToTree({
                          treeEntries,
                          selected: path,
                          isReversed,
                          contentMenu: contextualMenuAction,
                          itemProps: {item}
                      })}
                      openedItems={openPaths}
                      selectedItems={[path]}
                      onContextMenuItem={(object, event) => {
                          event.stopPropagation();
                          if (contextualMenuAction) {
                              contextualMenu.current(event, {path: object.id});
                          }
                      }}
                      onClickItem={object => {
                          const {node} = object.treeItemProps;
                          if (['jnt:externalLink', 'jnt:nodeLink'].includes(node.primaryNodeType.name)) {
                              openLinkDialog(node);
                          } else if (node.isTreeSelectable) {
                              dispatch(setPathAction(object.id, {sub: false}));
                          }
                      }}
                      onOpenItem={object => dispatch(openPathAction(object.id))}
                      onCloseItem={object => dispatch(closePathAction(object.id))}
            />
            {linkDialogProps.node && <LinkDialog {...linkDialogProps}/>}
            {item.treeConfig.showContextMenuOnRootPath &&
                <div
                    className="flexFluid"
                    data-cm-role="rootpath-context-menu-holder"
                    onContextMenu={event => contextualMenu.current(event, {path: rootPath})}
                />}
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
