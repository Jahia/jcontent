import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ToolBar from '../ToolBar';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';
import FileCard from './FileCard';
import {Grid, Paper, withStyles} from '@material-ui/core';
import {Typography} from '@jahia/ds-mui-theme';
import {Pagination} from '@jahia/react-material';
import DxContext from '../../../DxContext';
import UploadTransformComponent from '../UploadTransformComponent';
import {connect} from 'react-redux';
import {cmSetPage, cmSetPageSize} from '../pagination.redux-actions';
import FilesGridEmptyDropZone from './FilesGridEmptyDropZone';
import {cmSetPreviewSelection} from '../../../preview.redux-actions';
import {cmGoto, cmOpenPaths} from '../../../ContentManager.redux-actions';
import classNames from 'classnames';
import {extractPaths} from '../../../ContentManager.utils';

const styles = theme => ({
    grid: {
        flex: '1 1 0%',
        overflowY: 'auto',
        overflowX: 'hidden',
        margin: '0!important',
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 3
    },
    gridEmpty: {
        flex: '1 1 0%',
        margin: '0!important',
        backgroundColor: theme.palette.background.default
    },
    defaultGrid: {
        display: 'grid',
        gap: '16px 16px',
        boxShadow: 'none',
        justifyContent: 'center',
        background: theme.palette.background.default
    },
    thumbGrid: {
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))'
    },
    detailedGrid: {
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
    },
    empty: {
        textAlign: 'center',
        margin: theme.spacing.unit * 3
    }
});

export class FilesGrid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hoveredCard: null
        };
    }

    onHoverEnter($event, path) {
        this.setState({
            hoveredCard: path
        });
    }

    onHoverExit() {
        this.setState({
            hoveredCard: null
        });
    }

    render() {
        const {gridMode, t, contentNotFound, classes, path, totalCount, pagination, setPageSize, onPreviewSelect,
            setCurrentPage, rows, loading, mode, uiLang, siteKey, previewSelection, previewState, setPath} = this.props;
        const {hoveredCard} = this.state;

        if ((!rows || rows.length === 0) && loading) {
            return null;
        }

        if (contentNotFound) {
            return (
                <React.Fragment>
                    <ToolBar/>
                    <Grid container className={classes.gridEmpty} data-cm-role="grid-content-list">
                        <Typography variant="epsilon" className={classes.empty}>
                            {t('label.contentManager.contentNotFound')}
                        </Typography>
                    </Grid>
                </React.Fragment>
            );
        }

        if ((!rows || rows.length === 0) && !loading) {
            return (
                <React.Fragment>
                    <ToolBar/>
                    <FilesGridEmptyDropZone mode="browse-files" path={path}/>
                </React.Fragment>
            );
        }

        return (
            <React.Fragment>
                <ToolBar/>
                <div className={classes.grid} data-cm-role="grid-content-list">
                    <UploadTransformComponent uploadTargetComponent={Paper}
                                              uploadPath={path}
                                              mode="browse-files"
                                              className={classNames(classes.defaultGrid,
                                                  (!gridMode || gridMode === 'thumbnail') && classes.thumbGrid,
                                                  gridMode === 'detailed' && classes.detailedGrid)}
                    >
                        {this.props.rows.map((node, index) => (
                            <DxContext.Consumer key={node.uuid}>
                                {dxContext => (
                                    <FileCard
                                            gridMode={gridMode}
                                            mode={mode}
                                            uiLang={uiLang}
                                            siteKey={siteKey}
                                            previewSelection={previewSelection}
                                            previewState={previewState}
                                            index={index}
                                            isHovered={node.path === hoveredCard}
                                            node={node}
                                            dxContext={dxContext}
                                            setPath={setPath}
                                            onPreviewSelect={onPreviewSelect}
                                            onMouseEnter={$event => this.onHoverEnter($event, node.path)}
                                            onMouseLeave={$event => this.onHoverExit($event)}
                                        />
                                    )}
                            </DxContext.Consumer>
                        ))}
                    </UploadTransformComponent>
                </div>
                <Pagination
                    totalCount={totalCount}
                    pageSize={pagination.pageSize}
                    currentPage={pagination.currentPage}
                    onChangeRowsPerPage={setPageSize}
                    onChangePage={setCurrentPage}
                />
            </React.Fragment>
        );
    }
}

let mapStateToProps = state => ({
    path: state.path,
    pagination: state.pagination,
    gridMode: state.filesGrid.gridMode,
    mode: state.filesGrid.mode,
    siteKey: state.site,
    uiLang: state.uiLang,
    previewSelection: state.previewSelection,
    previewState: state.previewState
});

let mapDispatchToProps = dispatch => ({
    setCurrentPage: page => dispatch(cmSetPage(page)),
    onPreviewSelect: previewSelection => dispatch(cmSetPreviewSelection(previewSelection)),
    setPageSize: pageSize => dispatch(cmSetPageSize(pageSize)),
    setPath: (siteKey, path, mode) => {
        dispatch(cmOpenPaths(extractPaths(siteKey, path, mode)));
        dispatch(cmGoto({path: path}));
    }
});

FilesGrid.propTypes = {
    classes: PropTypes.object.isRequired,
    contentNotFound: PropTypes.bool,
    loading: PropTypes.bool.isRequired,
    pagination: PropTypes.object.isRequired,
    path: PropTypes.string.isRequired,
    rows: PropTypes.array.isRequired,
    setCurrentPage: PropTypes.func.isRequired,
    setPageSize: PropTypes.func.isRequired,
    gridMode: PropTypes.string.isRequired,
    t: PropTypes.func.isRequired,
    uiLang: PropTypes.string.isRequired,
    previewSelection: PropTypes.string,
    previewState: PropTypes.number.isRequired,
    siteKey: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    totalCount: PropTypes.number.isRequired,
    onPreviewSelect: PropTypes.func.isRequired,
    setPath: PropTypes.func.isRequired
};

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    translate(),
    withStyles(styles, {withTheme: true}),
)(FilesGrid);
