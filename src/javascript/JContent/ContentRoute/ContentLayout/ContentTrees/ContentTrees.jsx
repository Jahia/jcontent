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
import JContentConstants from '../../../JContent.constants';
import {Collections, File, FolderSpecial, Setting} from '@jahia/moonstone/dist/icons';

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

export class ContentTrees extends React.Component {
    constructor(props) {
        super(props);
        this.container = React.createRef();
    }

    convertPathsToTree(pickerEntries, mode) {
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

    render() {
        const {
            lang, siteKey, path, openPaths, t, setPath, openPath,
            closePath, classes, mode, contentTreeConfigs
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
                <div ref={setContainer} className={classes.listContainer} style={{width: contentManagerStyleConstants.treeDrawerWidth + 'px'}}>
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
                                                 convertPathsToTree={this.convertPathsToTree}
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
    contentTreeConfigs: PropTypes.array.isRequired
};

export default compose(
    withTranslation(),
    withStyles(styles, {withTheme: true}),
    connect(mapStateToProps, mapDispatchToProps)
)(ContentTrees);
