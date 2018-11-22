import React from 'react';
import Breadcrumb from './Breadcrumb';
import gql from 'graphql-tag';
import {Picker} from '@jahia/react-apollo';
import {translate} from 'react-i18next';
import {connect} from 'react-redux';
import {cmGoto} from '../redux/actions';
import {extractPaths} from '../utils.js';
import Constants from '../constants';
import {compose} from 'react-apollo';

class ContentBreadcrumbs extends React.Component {
    constructor(props) {
        super(props);
        this.picker = React.createRef();
    }

    generatePathParts(path) {
        let {siteKey, mode} = this.props;
        const sitePath = '/sites/' + siteKey + (mode === 'browse-files' ? '/files' : '');
        if (path.startsWith(sitePath + '/')) {
            path = path.substring(sitePath.length);
        } else {
            path = sitePath;
        }
        return extractPaths(siteKey, path, mode);
    }

    getPickerConfiguration(path) {
        let {t, siteKey, mode} = this.props;
        let rootPath = '/sites/' + siteKey;
        let pickerConfiguration = {};

        if (mode === Constants.mode.FILES) {
            pickerConfiguration.selectableTypes = ['jnt:folder'];
            pickerConfiguration.openableTypes = ['jnt:folder'];
            pickerConfiguration.rootLabel = t('label.contentManager.browseFiles');
            pickerConfiguration.rootPath = rootPath + '/files';
        } else if (path.indexOf(rootPath + '/contents') !== -1) {
            pickerConfiguration.selectableTypes = ['jmix:list'];
            pickerConfiguration.openableTypes = ['jmix:list', 'jnt:contentFolder'];
            pickerConfiguration.rootLabel = t('label.contentManager.browseFolders');
            pickerConfiguration.rootPath = rootPath + '/contents';
        } else {
            pickerConfiguration.selectableTypes = ['jnt:page'];
            pickerConfiguration.openableTypes = ['jnt:page', 'jnt:virtualsite', 'jnt:navMenuText'];
            pickerConfiguration.rootLabel = t('label.contentManager.browsePages');
            pickerConfiguration.rootPath = rootPath;
        }

        return pickerConfiguration;
    }

    render() {
        let {lang, siteKey, path, setUrl, mode} = this.props;
        let rootPath = '/sites/' + siteKey + (mode === 'browse-files' ? '/files' : '');
        let pickerConfiguration = this.getPickerConfiguration(path);
        let paths = this.generatePathParts(path);

        return (
            <Picker
                ref={this.picker}
                fragments={['displayName', {
                    applyFor: 'node',
                    gql: gql`fragment PrimaryNodeTypeName on JCRNode { primaryNodeType { name } }`
                }]}
                openableTypes={pickerConfiguration.openableTypes}
                openPaths={paths}
                queryVariables={{lang: lang}}
                rootPaths={[pickerConfiguration.rootPath]}
                selectableTypes={pickerConfiguration.selectableTypes}
                selectedPaths={paths}
                onSelectItem={(mode, path) => setUrl(mode, path)}
                >
                {({error, ...others}) => {
                    if (error) {
                        return null;
                    }
                    return (
                        <Breadcrumb
                            {...others}
                            path={path}
                            rootPath={rootPath}
                            rootLabel={pickerConfiguration.rootLabel}
                            mode={mode}
                            handleSelect={others.onSelectItem}
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
    path: state.path,
    params: state.params
});

const mapDispatchToProps = dispatch => ({
    setUrl: (mode, path) => dispatch(cmGoto({mode, path}))
});

export default compose(
    translate(),
    connect(mapStateToProps, mapDispatchToProps)
)(ContentBreadcrumbs);
