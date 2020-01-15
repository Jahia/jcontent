import React, {useState, useRef} from 'react';
import PropTypes from 'prop-types';
import ToolBar from '../ToolBar';
import {compose} from 'react-apollo';
import {useTranslation} from 'react-i18next';
import FileCard from './FileCard';
import {Grid, Paper, withStyles} from '@material-ui/core';
import {Typography} from '@jahia/design-system-kit';
import {Pagination, DxContext} from '@jahia/react-material';
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
        display: 'flex',
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
        flex: 1,
        display: 'grid',
        gap: '8px 8px',
        boxShadow: 'none',
        justifyContent: 'center',
        background: theme.palette.background.default
    },
    // MsGrid are css properties for IE, please don't remove them
    thumbGrid: {
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        msGridColumns: '( 1fr )[6]'
    },
    detailedGrid: {
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        msGridColumns: '( 1fr )[2]'
    },
    empty: {
        textAlign: 'center',
        margin: theme.spacing.unit * 3
    }
});

export const FilesGrid = ({
    gridMode,
    contentNotFound,
    classes,
    path,
    totalCount,
    pagination,
    setPageSize,
    onPreviewSelect,
    setCurrentPage,
    rows,
    loading,
    mode,
    uiLang,
    siteKey,
    previewSelection,
    previewState,
    setPath
}) => {
    const {t} = useTranslation();
    const mainPanelEl = useRef(null);
    const [hoveredCard, setHoveredCard] = useState(null);

    const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
    const onHoverEnter = (_, path) => {
        setHoveredCard(path);
    };

    const onHoverExit = () => {
        setHoveredCard(null);
    };

    const handleKeyboardNavigation = event => {
        // Right arrow code: 39, Down arrow code: 40
        if (selectedItemIndex !== rows.length - 1 && (event.keyCode === 39 || event.keyCode === 40)) {
            setSelectedItemIndex(selectedItemIndex + 1);
            onPreviewSelect(rows[selectedItemIndex + 1].path);
            // Left arrow code: 37, Up arrow code: 38
        } else if (selectedItemIndex !== 0 && (event.keyCode === 37 || event.keyCode === 38)) {
            setSelectedItemIndex(selectedItemIndex - 1);
            onPreviewSelect(rows[selectedItemIndex - 1].path);
        }
    };

    const setFocusOnMainContainer = () => {
        mainPanelEl.current.focus();
    };

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
            <div ref={mainPanelEl}
                 className={classes.grid}
                 data-cm-role="grid-content-list"
                 tabIndex="1"
                 onKeyDown={handleKeyboardNavigation}
                 onClick={setFocusOnMainContainer}
            >
                <UploadTransformComponent uploadTargetComponent={Paper}
                                          uploadPath={path}
                                          mode="browse-files"
                                          className={classNames(classes.defaultGrid,
                                              (!gridMode || gridMode === 'thumbnail') && classes.thumbGrid,
                                              gridMode === 'detailed' && classes.detailedGrid)}
                >
                    {rows.map((node, index) => (
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
                                    onPreviewSelect={(...args) => {
                                        setSelectedItemIndex(index);
                                        onPreviewSelect(...args);
                                    }}
                                    onMouseEnter={$event => {
                                        onHoverEnter($event, node.path);
                                    }}
                                    onMouseLeave={$event => {
                                        onHoverExit($event);
                                    }}
                                />
                            )}
                        </DxContext.Consumer>
                    ))}
                    {/* please keep this divs to handle the grid layout when there is less than 6 elements */}
                    <div/>
                    <div/>
                    <div/>
                    <div/>
                    <div/>
                    <div/>
                </UploadTransformComponent>
            </div>
            <Pagination
                totalCount={totalCount}
                pageSize={pagination.pageSize}
                currentPage={pagination.currentPage}
                labels={{
                    labelRowsPerPage: t('content-media-manager:label.pagination.rowsPerPage'),
                    of: t('content-media-manager:label.pagination.of')
                }}
                onChangePage={setCurrentPage}
                onChangeRowsPerPage={setPageSize}
            />
        </React.Fragment>
    );
};

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
    withStyles(styles, {withTheme: true})
)(FilesGrid);
