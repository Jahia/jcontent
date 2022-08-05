import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import FileCard from './FileCard';
import {Grid, Paper} from '@material-ui/core';
import {TablePagination, Typography} from '@jahia/moonstone';
import UploadTransformComponent from '../UploadTransformComponent';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {cmSetPage, cmSetPageSize} from '../pagination.redux';
import FilesGridEmptyDropZone from './FilesGridEmptyDropZone';
import {cmSetPreviewSelection} from '~/JContent/preview.redux';
import {cmGoto, cmOpenPaths} from '~/JContent/JContent.redux';
import classNames from 'clsx';
import {extractPaths} from '~/JContent/JContent.utils';
import {useKeyboardNavigation} from '../useKeyboardNavigation';
import JContentConstants from '~/JContent/JContent.constants';
import styles from './FilesGrid.scss';

export const FilesGrid = ({isContentNotFound, totalCount, rows, isLoading}) => {
    const {t} = useTranslation();
    const {path, pagination, mode, siteKey, uilang, previewSelection, previewState} = useSelector(state => ({
        path: state.jcontent.path,
        pagination: state.jcontent.pagination,
        mode: state.jcontent.filesGrid.mode,
        siteKey: state.site,
        uilang: state.uilang,
        previewSelection: state.jcontent.previewSelection,
        previewState: state.jcontent.previewState
    }), shallowEqual);
    const dispatch = useDispatch();
    const setCurrentPage = page => dispatch(cmSetPage(page - 1));
    const onPreviewSelect = previewSelection => dispatch(cmSetPreviewSelection(previewSelection));
    const setPageSize = pageSize => dispatch(cmSetPageSize(pageSize));
    const setPath = (siteKey, path, mode) => {
        dispatch(cmOpenPaths(extractPaths(siteKey, path, mode)));
        dispatch(cmGoto({path: path}));
    };

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
            <TablePagination totalNumberOfRows={totalCount}
                             currentPage={pagination.currentPage + 1}
                             rowsPerPage={pagination.pageSize}
                             label={{
                                 rowsPerPage: t('jcontent:label.pagination.rowsPerPage'),
                                 of: t('jcontent:label.pagination.of')
                             }}
                             rowsPerPageOptions={[10, 25, 50, 100]}
                             onPageChange={setCurrentPage}
                             onRowsPerPageChange={setPageSize}
            />
        </React.Fragment>
    );
};

FilesGrid.propTypes = {
    isContentNotFound: PropTypes.bool,
    isLoading: PropTypes.bool.isRequired,
    rows: PropTypes.array.isRequired,
    totalCount: PropTypes.number.isRequired
};

export default FilesGrid;
