import React from 'react';
import PropTypes from 'prop-types';
import {Picker} from '@jahia/react-apollo';
import {PredefinedFragments} from '@jahia/apollo-dx';
import {TreeView} from '@jahia/moonstone';
import gql from 'graphql-tag';
import JContentConstants from '../../../../JContent.constants';
import {Collections, File, FolderSpecial, Setting} from '@jahia/moonstone/dist/icons';

const PickerItemsFragment = {
    mixinTypes: {
        applyFor: 'node',
        variables: {
            lang: 'String!'
        },
        gql: gql`fragment MixinTypes on JCRNode {
            mixinTypes {
                name
            }
        }`
    },
    isPublished: {
        applyFor: 'node',
        variables: {
            lang: 'String!'
        },
        gql: gql`fragment PublicationStatus on JCRNode {
            publicationStatus: aggregatedPublicationInfo(language: $lang) {
                publicationStatus
            }
        }`
    },
    primaryNodeType: {
        applyFor: 'node',
        gql: gql`fragment PrimaryNodeTypeName on JCRNode {
            primaryNodeType {
                name
            }
        }`
    }
};

function getIcon(mode) {
    switch (mode) {
        case JContentConstants.mode.PAGES:
            return <File size="small"/>;
        case JContentConstants.mode.CONTENT_FOLDERS:
            return <FolderSpecial size="small"/>;
        case JContentConstants.mode.MEDIA:
            return <Collections size="small"/>;
        case JContentConstants.mode.APPS:
            return <Setting size="small"/>;
        default:
            return <File size="small"/>;
    }
}

function getParentPath(path) {
    return path.substr(0, path.lastIndexOf('/'));
}

function findInTree(tree, id) {
    for (var i = 0; i < tree.length; i++) {
        if (tree[i].id === id) {
            return tree[i];
        }

        let result = findInTree(tree[i].children, id);
        if (result) {
            return result;
        }
    }
}

function convertPathsToTree(pickerEntries, mode) {
    let tree = [];
    if (pickerEntries.length === 0) {
        return tree;
    }

    let rootElement = {
        id: pickerEntries[0].path,
        label: pickerEntries[0].node.displayName,
        hasChildren: pickerEntries[0].hasChildren,
        parent: getParentPath(pickerEntries[0].path),
        iconStart: getIcon(mode),
        children: []
    };
    tree.push(rootElement);
    for (let i = 1; i < pickerEntries.length; i++) {
        let parentPath = getParentPath(pickerEntries[i].path);
        let element = {
            id: pickerEntries[i].path,
            label: pickerEntries[i].node.displayName,
            hasChildren: pickerEntries[i].hasChildren,
            parent: parentPath,
            iconStart: getIcon(mode),
            children: []
        };
        let parent = findInTree(tree, parentPath);
        if (parent !== undefined) {
            parent.children.push(element);
        }
    }

    return tree;
}

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
                onOpenItem={(path, open) => handleOpen(path, open)}
                onSelectItem={path => handleSelect(path)}
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
