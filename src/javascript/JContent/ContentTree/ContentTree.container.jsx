import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';
import {withTranslation} from 'react-i18next';
import {connect} from 'react-redux';
import {cmClosePaths, cmGoto, cmOpenPaths} from '../JContent.redux';
import {compose} from '~/utils';
import ContentTree from './ContentTree';
import {setRefetcher} from '../JContent.refetches';
import contentManagerStyleConstants from '../JContent.style-constants';

const styles = () => ({
    listContainer: {
        flex: '1 0 0%',
        overflow: 'auto'
    },
    list: {
        width: 'fit-content',
        minWidth: '100%'
    }
});

export class ContentTreeContainer extends React.Component {
    constructor(props) {
        super(props);
        this.container = React.createRef();
    }

    render() {
        const {
            lang, siteKey, path, openPaths, t, setPath, openPath,
            closePath, classes, mode, contentTreeConfig
        } = this.props;
        const rootPath = '/sites/' + siteKey;
        const usedPath = path.startsWith(rootPath) ? path : rootPath;

        let setContainer = r => {
            if (r) {
                this.container.current = r;
            }
        };

        if (openPaths.findIndex(p => p === path) === -1) {
            openPaths.push(path);
        }

        return (
            <div ref={setContainer} className={classes.listContainer} style={{width: contentManagerStyleConstants.treeDrawerWidth + 'px'}}>
                <div className={classes.list}>
                    <ContentTree key={contentTreeConfig.key}
                                 container={this.container}
                                 mode={mode}
                                 siteKey={siteKey}
                                 path={usedPath}
                                 rootPath={rootPath + contentTreeConfig.rootPath}
                                 openPaths={openPaths}
                                 selectableTypes={contentTreeConfig.selectableTypes}
                                 lang={lang}
                                 dataCmRole={contentTreeConfig.key}
                                 handleOpen={(openedPath, open) => (open ? openPath(openedPath) : closePath(openedPath))}
                                 handleSelect={selectedPath => setPath(selectedPath, {sub: false})}
                                 openableTypes={contentTreeConfig.openableTypes}
                                 rootLabel={t(contentTreeConfig.rootLabel)}
                                 setRefetch={refetchingData => setRefetcher(contentTreeConfig.key, refetchingData)}
                    />
                </div>
            </div>
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
    classes: PropTypes.object.isRequired,
    closePath: PropTypes.func.isRequired,
    lang: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    openPath: PropTypes.func.isRequired,
    openPaths: PropTypes.arrayOf(PropTypes.string).isRequired,
    path: PropTypes.string.isRequired,
    setPath: PropTypes.func.isRequired,
    siteKey: PropTypes.string.isRequired,
    t: PropTypes.func.isRequired,
    contentTreeConfig: PropTypes.object.isRequired
};

export default compose(
    withTranslation(),
    withStyles(styles, {withTheme: true}),
    connect(mapStateToProps, mapDispatchToProps)
)(ContentTreeContainer);
