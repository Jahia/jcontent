import React from 'react';
import PropTypes from 'prop-types';
import {compose} from '~/utils';
import {useTranslation} from 'react-i18next';
import FileCard from './FileCard';
import {Grid, Paper} from '@material-ui/core';
import {Typography} from '@jahia/moonstone';
import {Pagination} from '@jahia/react-material';
import UploadTransformComponent from '../UploadTransformComponent';
import {connect} from 'react-redux';
import {cmSetPage, cmSetPageSize} from '../pagination.redux';
import FilesGridEmptyDropZone from './FilesGridEmptyDropZone';
import {cmSetPreviewSelection} from '~/JContent/preview.redux';
import {cmGoto, cmOpenPaths} from '~/JContent/JContent.redux';
import classNames from 'classnames';
import {extractPaths} from '~/JContent/JContent.utils';
import {useKeyboardNavigation} from '../useKeyboardNavigation';
import JContentConstants from '~/JContent/JContent.constants';
import styles from './FilesGrid.scss';

export const FilesGrid = ({
    isContentNotFound,
    path,
    totalCount,
    pagination,
    setPageSize,
    onPreviewSelect,
    setCurrentPage,
    rows,
    isLoading,
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

    if ((!rows || rows.length === 0) && isLoading) {
        return null;
    }

    if (isContentNotFound) {
        return (
            <React.Fragment>
                <Grid container className={styles.gridEmpty} data-cm-role="grid-content-list">
                    <Typography className={styles.empty}>
                        {t('jcontent:label.contentManager.contentNotFound')}
                    </Typography>
                </Grid>
            </React.Fragment>
        );
    }

    if ((!rows || rows.length === 0) && !isLoading) {
        return (
            <React.Fragment>
                <FilesGridEmptyDropZone mode={JContentConstants.mode.MEDIA} path={path}/>
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            <div ref={mainPanelRef}
                 className={styles.grid}
                 data-cm-role="grid-content-list"
                 tabIndex="1"
                 onKeyDown={handleKeyboardNavigation}
                 onClick={setFocusOnMainContainer}
            >
                <UploadTransformComponent uploadTargetComponent={Paper}
                                          uploadPath={path}
                                          mode="media"
                                          className={classNames(styles.defaultGrid, styles.detailedGrid)}
                >
                    {rows.map((node, index) => (
                        <FileCard key={node.uuid}
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
    isContentNotFound: PropTypes.bool,
    isLoading: PropTypes.bool.isRequired,
    pagination: PropTypes.object.isRequired,
    path: PropTypes.string.isRequired,
    rows: PropTypes.array.isRequired,
    setCurrentPage: PropTypes.func.isRequired,
    setPageSize: PropTypes.func.isRequired,
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
    connect(mapStateToProps, mapDispatchToProps)
)(FilesGrid);
