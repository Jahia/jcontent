import React from 'react';
import PropTypes from 'prop-types';
import {Picker} from '@jahia/react-apollo';
import {PredefinedFragments} from '@jahia/apollo-dx';
import {TreeView} from '@jahia/moonstone';
import {PickerItemsFragment} from './ContentTree.gq-fragments';
import {convertPathsToTree} from './ContentTree.utils';

class ContentTree extends React.Component {
    constructor(props) {
        super(props);
        this.picker = React.createRef();
    }

    render() {
        let {rootPath, openPaths, path, handleOpen, handleSelect, lang, openableTypes, selectableTypes, setRefetch, mode} = this.props;
        return (
            <Picker
                ref={this.picker}
                openSelection
                rootPaths={[rootPath]}
                openPaths={openPaths}
                openableTypes={openableTypes}
                selectableTypes={selectableTypes}
                queryVariables={{lang: lang}}
                selectedPaths={[path]}
                setRefetch={setRefetch}
                fragments={[PickerItemsFragment.mixinTypes, PickerItemsFragment.primaryNodeType, PickerItemsFragment.isPublished, PredefinedFragments.displayName]}
                onOpenItem={(openedPath, open) => handleOpen(openedPath, open)}
                onSelectItem={selectedPath => handleSelect(selectedPath)}
            >
                {({pickerEntries}) => {
                    return (
                        <TreeView isReversed
                                  data={convertPathsToTree(pickerEntries, mode)}
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
    handleOpen: PropTypes.func.isRequired,
    handleSelect: PropTypes.func.isRequired,
    lang: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    openPaths: PropTypes.arrayOf(PropTypes.string).isRequired,
    openableTypes: PropTypes.array.isRequired,
    path: PropTypes.string.isRequired,
    rootPath: PropTypes.string.isRequired,
    selectableTypes: PropTypes.array.isRequired,
    setRefetch: PropTypes.func.isRequired
};

export default ContentTree;
