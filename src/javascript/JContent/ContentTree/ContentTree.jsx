import React from 'react';
import PropTypes from 'prop-types';
import {Picker, PredefinedFragments} from '@jahia/data-helper';
import {TreeView} from '@jahia/moonstone';
import {PickerItemsFragment} from './ContentTree.gql-fragments';
import {convertPathsToTree} from './ContentTree.utils';

class ContentTree extends React.Component {
    constructor(props) {
        super(props);
        this.picker = React.createRef();
    }

    render() {
        let {openPaths, path, handleOpen, handleSelect, lang, siteKey,
            openableTypes, selectableTypes, setRefetch, mode, registryItem} = this.props;

        const rootPath = '/sites/' + siteKey;
        const selectedPaths = path.startsWith(rootPath) ? [path] : [rootPath];

        return (
            <Picker
                ref={this.picker}
                openSelection
                rootPaths={[rootPath]}
                openPaths={openPaths}
                openableTypes={openableTypes}
                selectableTypes={selectableTypes}
                queryVariables={{lang: lang}}
                selectedPaths={selectedPaths}
                setRefetch={setRefetch}
                fragments={[PickerItemsFragment.mixinTypes, PickerItemsFragment.primaryNodeType, PickerItemsFragment.isPublished, PredefinedFragments.displayName]}
                onOpenItem={(openedPath, open) => handleOpen(openedPath, open)}
                onSelectItem={selectedPath => handleSelect(selectedPath)}
            >
                {({pickerEntries}) => {
                    return (
                        <TreeView isReversed
                                  data={convertPathsToTree(pickerEntries, mode, registryItem)}
                                  openedItems={openPaths}
                                  selectedItems={[path]}
                                  onClickItem={object => handleSelect(object.id)}
                                  onOpenItem={object => handleOpen(object.id, true)}
                                  onCloseItem={object => handleOpen(object.id, false)}
                        />
                    );
                }}
            </Picker>
        );
    }
}

ContentTree.propTypes = {
    mode: PropTypes.string.isRequired,
    lang: PropTypes.string.isRequired,
    siteKey: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    openPaths: PropTypes.arrayOf(PropTypes.string).isRequired,
    registryItem: PropTypes.object,
    openableTypes: PropTypes.array.isRequired,
    selectableTypes: PropTypes.array.isRequired,
    handleOpen: PropTypes.func.isRequired,
    handleSelect: PropTypes.func.isRequired,
    setRefetch: PropTypes.func.isRequired
};

export default ContentTree;
