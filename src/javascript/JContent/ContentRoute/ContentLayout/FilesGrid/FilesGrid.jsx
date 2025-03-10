import React, {useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {FileCard} from './FileCard';
import {Grid, Paper} from '@material-ui/core';
import {TablePagination, Typography} from '@jahia/moonstone';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {cmSetPage, cmSetPageSize} from '~/JContent/redux/pagination.redux';
import FilesGridEmptyDropZone from './FilesGridEmptyDropZone';
import {cmSetPreviewSelection, cmSetPreviewState} from '~/JContent/redux/preview.redux';
import {CM_DRAWER_STATES, cmGoto, cmOpenPaths} from '~/JContent/redux/JContent.redux';
import classNames from 'clsx';
import clsx from 'clsx';
import {clickHandler, extractPaths} from '~/JContent/JContent.utils';
import {useKeyboardNavigation} from '../useKeyboardNavigation';
import JContentConstants from '~/JContent/JContent.constants';
import styles from './FilesGrid.scss';
import {useFileDrop} from '~/JContent/dnd/useFileDrop';
import {registry} from '@jahia/ui-extender';
import {batchActions} from 'redux-batched-actions';
import {cmSetSelection, cmSwitchSelection} from '../../../redux/selection.redux';
import {useUnselect} from '~/JContent/ContentRoute/ContentLayout/useUnselect';
import {Constants} from '~/ContentEditor/SelectorTypes/Picker/Picker.constants';

export const FilesGrid = ({isContentNotFound, totalCount, rows, isLoading}) => {
    const {t} = useTranslation('jcontent');
    const {
        mode,
        path,
        pagination,
        gridMode,
        siteKey,
        uilang,
        lang,
        previewSelection,
        previewState,
        selection
    } = useSelector(state => ({
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
    const onPreviewSelect = _previewSelection => dispatch(batchActions([cmSetPreviewSelection(_previewSelection.path), cmSetPreviewState(CM_DRAWER_STATES.SHOW)]));
    const onSelect = (node, event) => {
        const isMultipleSelectionMode = event.metaKey || event.ctrlKey;
        dispatch(isMultipleSelectionMode ? cmSwitchSelection(node.path) : cmSetSelection(node.path));
    };

    const onClick = (node, index, event) => {
        if (isPreviewOpened && !node.notSelectableForPreview) {
            setSelectedItemIndex(index);
            onPreviewSelect(node);
        } else if (!isPreviewOpened) {
            onSelect(node, event);
        }
    };

    const allowDoubleClickNavigation = nodeType => {
        return Constants.mode.SEARCH !== mode &&
            ((tableConfig.canAlwaysDoubleClickOnType && tableConfig.canAlwaysDoubleClickOnType(nodeType)) || (['jnt:folder', 'jnt:contentFolder'].includes(nodeType)));
    };

    const setPageSize = pageSize => dispatch(cmSetPageSize(pageSize));
    const setPath = (_siteKey, _path, _mode) => {
        dispatch(cmOpenPaths(extractPaths(_siteKey, _path, _mode)));
        dispatch(cmGoto({path: _path}));
    };

    const mainPanelRef = useRef(null);
    const [selectedItemIndex, setSelectedItemIndex] = useState(-1);

    const isPreviewOpened = previewState === CM_DRAWER_STATES.SHOW && selection.length === 0;

    const handleKeyboardNavigation = useKeyboardNavigation({
        selectedItemIndex, setSelectedItemIndex,
        listLength: rows.length,
        onSelectionChange: index => {
            if (isPreviewOpened) {
                const row = rows[index];
                document.querySelector(`[data-sel-role-card="${row.name}"]`).scrollIntoView(true);
                return onPreviewSelect(row);
            }

            return undefined;
        }
    });

    useUnselect({selection, isLoading, rows, path});

    const tableConfig = registry.get('accordionItem', mode)?.tableConfig;

    const [{isCanDrop, allowDrop}, drop] = useFileDrop({uploadType: JContentConstants.mode.UPLOAD, uploadPath: path});

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
            <FilesGridEmptyDropZone
                uploadType={JContentConstants.mode.UPLOAD}
                reference={el => {
                    mainPanelRef.current = el;
                    drop(mainPanelRef);
                }}
                isCanDrop={isCanDrop}
                allowDrop={allowDrop}
            />
        );
    }

    return (
        <>
            <div ref={el => {
                mainPanelRef.current = el;
                drop(mainPanelRef);
            }}
                 className={clsx(styles.grid, isCanDrop && styles.drop)}
                 data-cm-role="grid-content-list"
                 tabIndex="1"
                 onKeyDown={handleKeyboardNavigation}
                 onClick={() => {
                     mainPanelRef.current.focus();
                 }}
            >
                <Paper className={classNames(styles.defaultGrid, styles.detailedGrid)}>
                    {rows.map((node, index) => (
                        <FileCard key={node.uuid}
                                  mode={gridMode}
                                  uilang={uilang}
                                  lang={lang}
                                  siteKey={siteKey}
                                  selection={selection}
                                  previewSelection={isPreviewOpened ? previewSelection : null}
                                  isPreviewOpened={isPreviewOpened}
                                  index={index}
                                  node={node}
                                  setPath={setPath}
                                  contextualMenuAction="contentItemActionsMenu"
                                  tableConfig={tableConfig}
                                  onClick={e => {
                                      if (allowDoubleClickNavigation(node.primaryNodeType.name)) {
                                          clickHandler.handleEvent(e, () => onClick(node, index, e));
                                      } else {
                                          onClick(node, index, e);
                                      }
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
