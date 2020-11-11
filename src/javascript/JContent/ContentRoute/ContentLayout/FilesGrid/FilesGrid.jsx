import React from 'react';
import PropTypes from 'prop-types';
import {compose} from '~/utils';
import {useTranslation} from 'react-i18next';
import FileCard from './FileCard';
import {Grid, Paper, withStyles} from '@material-ui/core';
import {Typography} from '@jahia/design-system-kit';
import {Pagination} from '@jahia/react-material';
import UploadTransformComponent from '../UploadTransformComponent';
import {connect} from 'react-redux';
import {cmSetPage, cmSetPageSize} from '../pagination.redux';
import FilesGridEmptyDropZone from './FilesGridEmptyDropZone';
import {cmSetPreviewSelection} from '../../../preview.redux';
import {cmGoto, cmOpenPaths} from '../../../JContent.redux';
import classNames from 'classnames';
import {extractPaths} from '../../../JContent.utils';
import {useKeyboardNavigation} from '../useKeyboardNavigation';
import JContentConstants from '../../../JContent.constants';

const styles = theme => ({
    grid: {
        display: 'flex',
        flex: '1 1 0%',
        overflowY: 'auto',
        overflowX: 'hidden',
        margin: '0!important',
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 3,
        outline: 'none'
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
    uilang,
    siteKey,
    previewSelection,
    previewState,
    setPath
}) => {
    const {t} = useTranslation();

    const {
        mainPanelRef,
        handleKeyboardNavigation,
        setFocusOnMainContainer,
        setSelectedItemIndex
    } = useKeyboardNavigation({
        listLength: rows.length,
        onSelectionChange: index => onPreviewSelect(rows[index].path)
    });

    if ((!rows || rows.length === 0) && loading) {
        return null;
    }

    if (contentNotFound) {
        return (
            <React.Fragment>
                <Grid container className={classes.gridEmpty} data-cm-role="grid-content-list">
                    <Typography variant="epsilon" className={classes.empty}>
                        {t('jcontent:label.contentManager.contentNotFound')}
                    </Typography>
                </Grid>
            </React.Fragment>
        );
    }

    if ((!rows || rows.length === 0) && !loading) {
        return (
            <React.Fragment>
                <FilesGridEmptyDropZone mode={JContentConstants.mode.MEDIA} path={path}/>
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            <div ref={mainPanelRef}
                 className={classes.grid}
                 data-cm-role="grid-content-list"
                 tabIndex="1"
                 onKeyDown={handleKeyboardNavigation}
                 onClick={setFocusOnMainContainer}
            >
                <UploadTransformComponent uploadTargetComponent={Paper}
                                          uploadPath={path}
                                          mode="media"
                                          className={classNames(classes.defaultGrid,
                                              gridMode === JContentConstants.gridMode.THUMBNAIL && classes.detailedGrid)}
                >
                    {rows.map((node, index) => (
                        <FileCard key={node.uuid}
                                  gridMode={gridMode}
                                  mode={mode}
                                  uilang={uilang}
                                  siteKey={siteKey}
                                  previewSelection={previewSelection}
                                  previewState={previewState}
                                  index={index}
                                  node={node}
                                  setPath={setPath}
                                  onPreviewSelect={(...args) => {
                                      setSelectedItemIndex(index);
                                      onPreviewSelect(...args);
                                  }}
                        />
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
                    labelRowsPerPage: t('jcontent:label.pagination.rowsPerPage'),
                    of: t('jcontent:label.pagination.of')
                }}
                onChangePage={setCurrentPage}
                onChangeRowsPerPage={setPageSize}
            />
        </React.Fragment>
    );
};

let mapStateToProps = state => ({
    path: state.jcontent.path,
    pagination: state.jcontent.pagination,
    gridMode: state.jcontent.filesGrid.gridMode,
    mode: state.jcontent.filesGrid.mode,
    siteKey: state.site,
    uilang: state.uilang,
    previewSelection: state.jcontent.previewSelection,
    previewState: state.jcontent.previewState
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
    uilang: PropTypes.string.isRequired,
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
