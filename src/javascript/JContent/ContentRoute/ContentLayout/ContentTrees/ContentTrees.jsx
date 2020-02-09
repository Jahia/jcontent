import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';
import {withTranslation} from 'react-i18next';
import {lodash as _} from 'lodash';
import {connect} from 'react-redux';
import {cmClosePaths, cmGoto, cmOpenPaths} from '../../../JContent.redux';
import {compose} from 'react-apollo';
import ContentTree from './ContentTree';
import {setRefetcher} from '../../../JContent.refetches';
import contentManagerStyleConstants from '../../../JContent.style-constants';

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

export class ContentTrees extends React.Component {
    constructor(props) {
        super(props);
        this.container = React.createRef();
    }

    render() {
        const {
            lang, siteKey, path, openPaths, t, setPath, openPath,
            closePath, classes, mode, width, contentTreeConfigs
        } = this.props;
        const rootPath = '/sites/' + siteKey;
        const usedPath = path.startsWith(rootPath) ? path : rootPath;

        let setContainer = r => {
            if (r) {
                this.container.current = r;
            }
        };

        return (
            <React.Fragment>
                <div ref={setContainer} className={classes.listContainer} style={{width: width + 'px'}}>
                    <div className={classes.list}>
                        {
                            _.map(contentTreeConfigs, contentTreeConfig => {
                                return (
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
                                                 handleOpen={(path, open) => (open ? openPath(path) : closePath(path))}
                                                 handleSelect={path => setPath(path, {sub: false})}
                                                 openableTypes={contentTreeConfig.openableTypes}
                                                 rootLabel={t(contentTreeConfig.rootLabel)}
                                                 setRefetch={refetchingData => setRefetcher(contentTreeConfig.key, refetchingData)}
                                    />
                                );
                            })
                        }
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    siteKey: state.site,
    lang: state.language,
    path: state.path,
    mode: state.mode,
    openPaths: state.openPaths,
    previewSelection: state.previewSelection,
    width: state.treeWidth
});

const mapDispatchToProps = dispatch => ({
    setPath: (path, params) => dispatch(cmGoto({path, params})),
    openPath: path => dispatch(cmOpenPaths([path])),
    closePath: path => dispatch(cmClosePaths([path]))
});

ContentTrees.propTypes = {
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
    width: PropTypes.number,
    contentTreeConfigs: PropTypes.array.isRequired
};

ContentTrees.defaultProps = {
    width: contentManagerStyleConstants.treeDrawerWidth
};

export default compose(
    withTranslation(),
    withStyles(styles, {withTheme: true}),
    connect(mapStateToProps, mapDispatchToProps)
)(ContentTrees);
