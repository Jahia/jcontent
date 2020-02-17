import React from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from 'react-i18next';
import {connect} from 'react-redux';
import {cmClosePaths, cmGoto, cmOpenPaths} from '../JContent.redux';
import {compose} from '~/utils';
import ContentTree from './ContentTree';
import {setRefetcher} from '../JContent.refetches';
import {registry} from '@jahia/ui-extender';

export class ContentTreeContainer extends React.Component {
    constructor(props) {
        super(props);
        this.container = React.createRef();
    }

    render() {
        const {
            lang, siteKey, path, openPaths, t, setPath, openPath,
            closePath, mode, config
        } = this.props;
        const rootPath = '/sites/' + siteKey;
        const usedPath = path.startsWith(rootPath) ? path : rootPath;

        if (openPaths.findIndex(p => p === path) === -1) {
            openPaths.push(path);
        }

        let registryItem = registry.find({type: 'accordionItem', target: 'jcontent', key: mode});

        return (
            <ContentTree key={config.key}
                         container={this.container}
                         mode={mode}
                         siteKey={siteKey}
                         path={usedPath}
                         registry={registryItem[0]}
                         rootPath={rootPath + config.rootPath}
                         openPaths={openPaths}
                         selectableTypes={config.selectableTypes}
                         lang={lang}
                         dataCmRole={config.key}
                         handleOpen={(openedPath, open) => (open ? openPath(openedPath) : closePath(openedPath))}
                         handleSelect={selectedPath => setPath(selectedPath, {sub: false})}
                         openableTypes={config.openableTypes}
                         rootLabel={t(config.rootLabel)}
                         setRefetch={refetchingData => setRefetcher(config.key, refetchingData)}
            />
        );
    }
}

const mapStateToProps = state => ({
    siteKey: state.site,
    lang: state.language,
    path: state.jcontent.path,
    mode: state.jcontent.mode,
    openPaths: state.jcontent.openPaths,
    previewSelection: state.jcontent.previewSelection
});

const mapDispatchToProps = dispatch => ({
    setPath: (path, params) => dispatch(cmGoto({path, params})),
    openPath: path => dispatch(cmOpenPaths([path])),
    closePath: path => dispatch(cmClosePaths([path]))
});

ContentTreeContainer.propTypes = {
    closePath: PropTypes.func.isRequired,
    lang: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    openPath: PropTypes.func.isRequired,
    openPaths: PropTypes.arrayOf(PropTypes.string).isRequired,
    path: PropTypes.string.isRequired,
    setPath: PropTypes.func.isRequired,
    siteKey: PropTypes.string.isRequired,
    t: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired
};

export default compose(
    withTranslation(),
    connect(mapStateToProps, mapDispatchToProps)
)(ContentTreeContainer);
