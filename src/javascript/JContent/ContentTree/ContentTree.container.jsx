import React from 'react';
import PropTypes from 'prop-types';
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
            lang, siteKey, path, openPaths, setPath, openPath,
            closePath, mode, config
        } = this.props;

        if (openPaths.findIndex(p => p === path) === -1) {
            openPaths.push(path);
        }

        let registryItem = registry.find({type: 'accordionItem', target: 'jcontent', key: mode});

        return (
            <ContentTree key={config.key}
                         mode={mode}
                         lang={lang}
                         siteKey={siteKey}
                         path={path}
                         openPaths={openPaths}
                         registryItem={registryItem[0]}
                         openableTypes={config.openableTypes}
                         selectableTypes={config.selectableTypes}
                         handleOpen={(openedPath, open) => (open ? openPath(openedPath) : closePath(openedPath))}
                         handleSelect={selectedPath => setPath(selectedPath, {sub: false})}
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
    mode: PropTypes.string.isRequired,
    lang: PropTypes.string.isRequired,
    siteKey: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    openPaths: PropTypes.arrayOf(PropTypes.string).isRequired,
    config: PropTypes.object.isRequired,
    openPath: PropTypes.func.isRequired,
    closePath: PropTypes.func.isRequired,
    setPath: PropTypes.func.isRequired
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(ContentTreeContainer);
