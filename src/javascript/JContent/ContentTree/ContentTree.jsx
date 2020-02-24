import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {cmClosePaths, cmGoto, cmOpenPaths} from '../JContent.redux';
import {compose} from '~/utils';
import {setRefetcher} from '../JContent.refetches';
import {Picker, PredefinedFragments} from '@jahia/data-helper';
import {PickerItemsFragment} from './ContentTree.gql-fragments';
import {TreeView} from '@jahia/moonstone';
import {convertPathsToTree} from './ContentTree.utils';

export class ContentTree extends React.Component {
    constructor(props) {
        super(props);
        this.container = React.createRef();
    }

    render() {
        const {
            lang, siteKey, path, openPaths, setPath, openPath,
            closePath, item
        } = this.props;

        const rootPath = '/sites/' + siteKey + item.config.rootPath;

        if (openPaths.findIndex(p => p === rootPath) === -1) {
            openPaths.push(rootPath);
        }

        return (
            <Picker
                openSelection
                hideRoot={item.config.hideRoot}
                rootPaths={[rootPath]}
                openPaths={openPaths}
                openableTypes={item.config.openableTypes}
                selectableTypes={item.config.selectableTypes}
                queryVariables={{lang: lang}}
                selectedPaths={[path]}
                setRefetch={refetchingData => setRefetcher(item.config.key, refetchingData)}
                fragments={[PickerItemsFragment.mixinTypes, PickerItemsFragment.primaryNodeType, PickerItemsFragment.isPublished, PickerItemsFragment.lock, PredefinedFragments.displayName]}
                onOpenItem={(openedPath, open) => (open ? openPath(openedPath) : closePath(openedPath))}
                onSelectItem={selectedPath => setPath(selectedPath, {sub: false})}
            >
                {({pickerEntries}) => {
                    return (
                        <TreeView isReversed
                                  data={convertPathsToTree(pickerEntries, path)}
                                  openedItems={openPaths}
                                  selectedItems={[path]}
                                  onClickItem={object => setPath(object.id, {sub: false})}
                                  onOpenItem={object => openPath(object.id)}
                                  onCloseItem={object => closePath(object.id)}
                        />
                    );
                }}
            </Picker>
        );
    }
}

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
