import React from 'react';
import {Picker} from '@jahia/react-apollo';
import {PredefinedFragments} from '@jahia/apollo-dx';
import PickerViewMaterial from '../../PickerViewMaterial';
import gql from 'graphql-tag';

const PickerItemsFragment = {
    mixinTypes: {
        applyFor: 'node',
        variables: {
            lang: 'String!'
        },
        gql: gql`
            fragment MixinTypes on JCRNode {
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
        gql: gql`
            fragment PublicationStatus on JCRNode {
                publicationStatus: aggregatedPublicationInfo(language: $lang) {
                    publicationStatus
                }
            }
        `
    },
    primaryNodeType: {
        applyFor: 'node',
        gql: gql`fragment PrimaryNodeTypeName on JCRNode { primaryNodeType { name } }`
    }
};

export default class ContentTree extends React.Component {
    constructor(props) {
        super(props);
        this.picker = React.createRef();
    }

    render() {
        let {rootPath, path, openPaths, handleOpen, handleSelect, lang, openableTypes, selectableTypes, rootLabel, setRefetch, dataCmRole, container} = this.props;
        return (
            <Picker
                ref={this.picker}
                rootPaths={[rootPath]}
                openPaths={openPaths}
                openableTypes={openableTypes}
                selectableTypes={selectableTypes}
                queryVariables={{lang: lang}}
                selectedPaths={[path]}
                openSelection={false}
                setRefetch={setRefetch}
                fragments={[PickerItemsFragment.mixinTypes, PickerItemsFragment.primaryNodeType, PickerItemsFragment.isPublished, PredefinedFragments.displayName]}
                onOpenItem={(path, open) => handleOpen(path, open)}
                onSelectItem={path => handleSelect(path)}
            >
                {({handleSelect, ...others}) => (
                    <PickerViewMaterial {...others} dataCmRole={dataCmRole} rootLabel={rootLabel} container={container}/>
                )}
            </Picker>
        );
    }

    resolveMenu(path) {
        let {mode, siteKey} = this.props;
        switch (mode) {
            case 'browse-files':
                return 'contextualMenuFiles';
            default:
                return path.indexOf(`/sites/${siteKey}/contents`) !== -1 ? 'contextualMenuFolders' : 'contextualMenuPages';
        }
    }
}
