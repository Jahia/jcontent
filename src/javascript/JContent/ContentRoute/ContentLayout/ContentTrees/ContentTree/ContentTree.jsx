import React from 'react';
import PropTypes from 'prop-types';
import {PredefinedFragments, Picker} from '@jahia/data-helper';
import {TreeView} from '@jahia/moonstone';
import gql from 'graphql-tag';
import {registry} from '@jahia/ui-extender';
import {File} from '@jahia/moonstone/dist/icons';

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
    let registryItem = registry.find({type: 'accordionItem', target: 'jcontent', key: mode});
    const Icon = registry[0] ? registryItem[0].icon : <File/>;
    return <Icon.type {...Icon.props} size="small"/>;
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
        } else if (!findInTree(tree, element.id)) {
            tree.push(element);
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
