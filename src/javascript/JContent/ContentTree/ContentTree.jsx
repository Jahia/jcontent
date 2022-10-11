import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {displayName, lockInfo, parentNode, useTreeEntries} from '@jahia/data-helper';
import {PickerItemsFragment} from './ContentTree.gql-fragments';
import {TreeView} from '@jahia/moonstone';
import {ContextualMenu} from '@jahia/ui-extender';
import {convertPathsToTree} from './ContentTree.utils';
import {refetchTypes, setRefetcher, unsetRefetcher} from '../JContent.refetches';
import {cmClosePaths, cmGoto, cmOpenPaths} from '~/JContent/JContent.redux';
import {arrayValue, booleanValue} from '~/JContent/JContent.utils';
import clsx from 'clsx';
import {useNodeDrop} from '~/JContent/dnd/useNodeDrop';
import {useNodeDrag} from '~/JContent/dnd/useNodeDrag';

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
            canReorder: PropTypes.bool
        })
    }).isRequired
});

const ItemComponent = ({children, node, item, ...props}) => {
    const ref = useRef(null);
    const {dropClasses} = useNodeDrop(node, item.treeConfig.dnd && item.treeConfig.dnd.canDrop && ref, item.treeConfig.dnd && item.treeConfig.dnd.canReorder);
    const {dragClasses} = useNodeDrag(node, item.treeConfig.dnd && item.treeConfig.dnd.canDrag && ref);

    return (
        <>
            <li ref={ref} {...props} className={clsx([...dragClasses, ...dropClasses])}>
                {children}
            </li>
        </>
    );
};

ItemComponent.propTypes = {
    item: accordionPropType,
    children: PropTypes.node,
    node: PropTypes.object
};

export const ContentTree = ({setPathAction, openPathAction, closePathAction, item, selector, refetcherType, isReversed, contextualMenuAction}) => {
    const dispatch = useDispatch();
    const {lang, siteKey, path, openPaths} = useSelector(selector, shallowEqual);
    const rootPath = item.getRootPath(siteKey);

    if (openPaths && openPaths.findIndex(p => p === rootPath) === -1) {
        openPaths.push(rootPath);
    }

    const useTreeEntriesOptionsJson = {
        fragments: [PickerItemsFragment.mixinTypes, PickerItemsFragment.primaryNodeType, PickerItemsFragment.isPublished, lockInfo, parentNode, displayName],
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
                      data={convertPathsToTree({treeEntries, selected: path, isReversed, contentMenu: contextualMenuAction, itemProps: {item}})}
                      openedItems={openPaths}
                      selectedItems={[path]}
                      onContextMenuItem={(object, event) => {
                          event.stopPropagation();
                          if (contextualMenuAction) {
                              contextualMenu.current(event, {path: object.id});
                          }
                      }}
                      onClickItem={object => dispatch(setPathAction(object.id, {sub: false}))}
                      onOpenItem={object => dispatch(openPathAction(object.id))}
                      onCloseItem={object => dispatch(closePathAction(object.id))}
            />
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
