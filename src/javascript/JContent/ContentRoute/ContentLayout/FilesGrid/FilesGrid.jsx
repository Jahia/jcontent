import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import FileCard from './FileCard';
import {Grid, Paper} from '@material-ui/core';
import {TablePagination, Typography} from '@jahia/moonstone';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {cmSetPage, cmSetPageSize} from '~/JContent/redux/pagination.redux';
import FilesGridEmptyDropZone from './FilesGridEmptyDropZone';
import {cmSetPreviewSelection} from '~/JContent/redux/preview.redux';
import {cmGoto, cmOpenPaths} from '~/JContent/redux/JContent.redux';
import classNames from 'clsx';
import {extractPaths} from '~/JContent/JContent.utils';
import {useKeyboardNavigation} from '../useKeyboardNavigation';
import JContentConstants from '~/JContent/JContent.constants';
import styles from './FilesGrid.scss';
import {useFileDrop} from '~/JContent/dnd/useFileDrop';
import clsx from 'clsx';

export const FilesGrid = ({isContentNotFound, totalCount, rows, isLoading}) => {
    const {t} = useTranslation('jcontent');
    const {path, pagination, mode, siteKey, uilang, lang, previewSelection} = useSelector(state => ({
        path: state.jcontent.path,
        pagination: state.jcontent.pagination,
        mode: state.jcontent.filesGrid.mode,
        siteKey: state.site,
        uilang: state.uilang,
        lang: state.lang,
        previewSelection: state.jcontent.previewSelection
    }), shallowEqual);
    const dispatch = useDispatch();
    const setCurrentPage = page => dispatch(cmSetPage(page - 1));
    const onPreviewSelect = previewSelection => dispatch(cmSetPreviewSelection(previewSelection.path));
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
        onSelectionChange: index => {
            const row = rows[index];
            document.querySelector(`[data-sel-role-card="${row.name}"]`).scrollIntoView(true);
            return onPreviewSelect(row);
        }
    });

    const {isCanDrop} = useFileDrop({uploadType: JContentConstants.mode.UPLOAD, uploadPath: path, ref: mainPanelRef});

    if ((!rows || rows.length === 0) && isLoading) {
        return null;
    }

    if (isContentNotFound) {
        return (
            <Grid container className={styles.gridEmpty} data-cm-role="grid-content-list">
                <Typography className={styles.empty}>
                    {t('jcontent:label.contentManager.contentNotFound')}
                </Typography>
            </Grid>
        );
    }

    if ((!rows || rows.length === 0) && !isLoading) {
        return (
            <FilesGridEmptyDropZone uploadType={JContentConstants.mode.UPLOAD} reference={mainPanelRef} isCanDrop={isCanDrop}/>
        );
    }

    return (
        <>
            <div ref={mainPanelRef}
                 className={clsx(styles.grid, isCanDrop && styles.drop)}
                 data-cm-role="grid-content-list"
                 tabIndex="1"
                 onKeyDown={handleKeyboardNavigation}
                 onClick={setFocusOnMainContainer}
            >
                <Paper className={classNames(styles.defaultGrid, styles.detailedGrid)}>
                    {rows.map((node, index) => (
                        <FileCard key={node.uuid}
                                  mode={mode}
                                  uilang={uilang}
                                  lang={lang}
                                  siteKey={siteKey}
                                  previewSelection={previewSelection}
                                  index={index}
                                  node={node}
                                  setPath={setPath}
                                  contextualMenuAction="contentMenu"
                                  onPreviewSelect={(...args) => {
                                      setSelectedItemIndex(index);
                                      onPreviewSelect(...args);
                                  }}
                        />
                    ))}
                </Paper>
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
        </>
    );
};

FilesGrid.propTypes = {
    isContentNotFound: PropTypes.bool,
    isLoading: PropTypes.bool.isRequired,
    rows: PropTypes.array.isRequired,
    totalCount: PropTypes.number.isRequired
};

export default FilesGrid;
