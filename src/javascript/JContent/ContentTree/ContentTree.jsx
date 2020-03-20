import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {cmClosePaths, cmGoto, cmOpenPaths} from '../JContent.redux';
import {compose} from '~/utils';
import {displayName, lockInfo, useTreeEntries} from '@jahia/data-helper';
import {PickerItemsFragment} from './ContentTree.gql-fragments';
import {TreeView} from '@jahia/moonstone';
import {ContextualMenu} from '@jahia/ui-extender';
import {convertPathsToTree} from './ContentTree.utils';
import {refetchTypes, setRefetcher, unsetRefetcher} from '../JContent.refetches';

export const ContentTree = ({lang, siteKey, path, openPaths, setPath, openPath, closePath, item}) => {
    const rootPath = '/sites/' + siteKey + item.config.rootPath;

    if (openPaths.findIndex(p => p === rootPath) === -1) {
        openPaths.push(rootPath);
    }

    const {treeEntries, refetch} = useTreeEntries({
        fragments: [PickerItemsFragment.mixinTypes, PickerItemsFragment.primaryNodeType, PickerItemsFragment.isPublished, lockInfo, displayName],
        rootPaths: [rootPath],
        openPaths: openPaths,
        selectedPaths: [path],
        openableTypes: item.config.openableTypes,
        selectableTypes: item.config.selectableTypes,
        queryVariables: {language: lang},
        hideRoot: item.config.hideRoot
    });

    let switchPath;
    // If path is root one but root is hidden, then select its first child
    if (((path === rootPath) || (path === rootPath + '/')) && item.config.hideRoot && treeEntries.length > 0) {
        const first = treeEntries[0];
        first.selected = true;
        switchPath = first.path;
    }

    useEffect(() => {
        if (switchPath) {
            setPath(switchPath);
        }
    }, [setPath, switchPath]);

    useEffect(() => {
        setRefetcher(refetchTypes.CONTENT_TREE, {
            refetch: refetch
        });
        return () => {
            unsetRefetcher(refetchTypes.CONTENT_TREE);
        };
    });

    let contextualMenu = React.createRef();

    return (
        <React.Fragment>
            <ContextualMenu ref={contextualMenu} actionKey="contentMenu" context={{}}/>
            <TreeView isReversed
                      data={convertPathsToTree(treeEntries, path)}
                      openedItems={openPaths}
                      selectedItems={[path]}
                      onContextMenuItem={(object, event) => {
                          event.stopPropagation();
                          contextualMenu.current.open(event, {path: object.id});
                      }}
                      onClickItem={object => setPath(object.id, {sub: false})}
                      onOpenItem={object => openPath(object.id)}
                      onCloseItem={object => closePath(object.id)}
            />
        </React.Fragment>
    );
};

const mapStateToProps = state => ({
    siteKey: state.site,
    lang: state.language,
    path: state.jcontent.path,
    openPaths: state.jcontent.openPaths,
    previewSelection: state.jcontent.previewSelection
});

const mapDispatchToProps = dispatch => ({
    setPath: (path, params) => dispatch(cmGoto({path, params})),
    openPath: path => dispatch(cmOpenPaths([path])),
    closePath: path => dispatch(cmClosePaths([path]))
});

ContentTree.propTypes = {
    lang: PropTypes.string.isRequired,
    siteKey: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    openPaths: PropTypes.arrayOf(PropTypes.string).isRequired,
    item: PropTypes.object.isRequired,
    openPath: PropTypes.func.isRequired,
    closePath: PropTypes.func.isRequired,
    setPath: PropTypes.func.isRequired
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(ContentTree);
