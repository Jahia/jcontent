import React from 'react';
import {Picker} from '@jahia/react-apollo';
import {PredefinedFragments} from '@jahia/apollo-dx';
import {PickerItemsFragment} from '../../gqlQueries';
import CmPickerViewMaterial from '../../picker/CmPickerViewMaterial';

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
                    <CmPickerViewMaterial {...others} dataCmRole={dataCmRole} rootLabel={rootLabel} container={container}/>
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
