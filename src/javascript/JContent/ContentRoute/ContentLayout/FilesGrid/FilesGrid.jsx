import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import FileCard from './FileCard';
import {Grid, Paper} from '@material-ui/core';
import {TablePagination, Typography} from '@jahia/moonstone';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {cmSetPage, cmSetPageSize} from '~/JContent/redux/pagination.redux';
import FilesGridEmptyDropZone from './FilesGridEmptyDropZone';
import {cmGoto, cmOpenPaths} from '~/JContent/redux/JContent.redux';
import classNames from 'clsx';
import clsx from 'clsx';
import {extractPaths} from '~/JContent/JContent.utils';
import JContentConstants from '~/JContent/JContent.constants';
import styles from './FilesGrid.scss';
import {useFileDrop} from '~/JContent/dnd/useFileDrop';
import {registry} from '@jahia/ui-extender';
import {cmClearSelection} from '../../../redux/selection.redux';

export const FilesGrid = ({isContentNotFound, totalCount, rows, isLoading}) => {
    const {t} = useTranslation('jcontent');
    const {mode, path, pagination, gridMode, siteKey, uilang, lang, selection} = useSelector(state => ({
        mode: state.jcontent.mode,
        path: state.jcontent.path,
        pagination: state.jcontent.pagination,
        gridMode: state.jcontent.filesGrid.mode,
        siteKey: state.site,
        uilang: state.uilang,
        lang: state.language,
        selection: state.jcontent.selection,
        previewSelection: state.jcontent.previewSelection,
        previewState: state.jcontent.previewState
    }), shallowEqual);
    const dispatch = useDispatch();
    const setCurrentPage = page => dispatch(cmSetPage(page - 1));
    const setPageSize = pageSize => dispatch(cmSetPageSize(pageSize));
    const setPath = (siteKey, path, mode) => {
        dispatch(cmOpenPaths(extractPaths(siteKey, path, mode)));
        dispatch(cmGoto({path: path}));
    };

    const mainPanelRef = useRef();

    // This is temporary fix, see https://jira.jahia.org/browse/BACKLOG-13981 for final feature
    useEffect(() => {
        if (selection.length > 0) {
            dispatch(cmClearSelection());
        }
    }, [selection, dispatch]);

    const tableConfig = registry.get('accordionItem', mode)?.tableConfig;

    const [{isCanDrop}, drop] = useFileDrop({uploadType: JContentConstants.mode.UPLOAD, uploadPath: path});
    drop(mainPanelRef);

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
            >
                <Paper className={classNames(styles.defaultGrid, styles.detailedGrid)}>
                    {rows.map((node, index) => (
                        <FileCard key={node.uuid}
                                  mode={gridMode}
                                  uilang={uilang}
                                  lang={lang}
                                  siteKey={siteKey}
                                  index={index}
                                  node={node}
                                  setPath={setPath}
                                  contextualMenuAction="contentMenu"
                                  tableConfig={tableConfig}
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
