import React, {useEffect, useMemo, useRef} from 'react';
import PropTypes from 'prop-types';
import {ContextualMenu} from '@jahia/ui-extender';
import * as _ from 'lodash';
import {useTranslation} from 'react-i18next';
import {CM_DRAWER_STATES, cmGoto, cmOpenPaths} from '~/JContent/JContent.redux';
import {allowDoubleClickNavigation, extractPaths} from '~/JContent/JContent.utils';
import {useSelector, useDispatch, shallowEqual} from 'react-redux';
import UploadTransformComponent from '../UploadTransformComponent';
import {cmSetPreviewSelection} from '~/JContent/preview.redux';
import {cmSetPage, cmSetPageSize} from '../pagination.redux';
import {cmAddSelection, cmRemoveSelection, cmSwitchSelection} from '../contentSelection.redux';
import {cmSetSort} from '../sort.redux';
import JContentConstants from '~/JContent/JContent.constants';
import ContentListEmptyDropZone from './ContentEmptyDropZone';
import ContentNotFound from './ContentNotFound';
import EmptyTable from './EmptyTable';
import {Table, TableBody, TablePagination, TableRow} from '@jahia/moonstone';
import {useExpanded, useTable} from 'react-table';
import {useRowSelection, useSort} from './reactTable/plugins';
import ContentListHeader from './ContentListHeader/ContentListHeader';
import css from './ContentTable.scss';
import {allColumnData, reducedColumnData} from './reactTable/columns';
import ContentTableWrapper from './ContentTableWrapper';
import {flattenTree, isInSearchMode} from '../ContentLayout.utils';
import ContentTypeSelector from './ContentTypeSelector';
import {useKeyboardNavigation} from '../useKeyboardNavigation';
import {batchActions} from 'redux-batched-actions';

export const ContentTable = ({
    rows,
    isContentNotFound,
    totalCount,
    dataCounts,
    isLoading,
    isAllowUpload,
    selector,
    reactTableSelectors,
    reactTableActions,
    reduxActions,
    columnData,
    ctxMenuActionKey,
    ContentTypeSelector}) => {
    const {mode, previewSelection, siteKey, path, pagination, previewState, selection, tableView} = useSelector(selector, shallowEqual);
    const dispatch = useDispatch();
    const {t} = useTranslation();
    const paths = useMemo(() => flattenTree(rows).map(n => n.path), [rows]);
    const {
        mainPanelRef,
        handleKeyboardNavigation,
        setFocusOnMainContainer,
        setSelectedItemIndex
    } = useKeyboardNavigation({
        listLength: paths.length,
        onSelectionChange: index => {
            if (isPreviewOpened) {
                dispatch(reduxActions.onPreviewSelectAction(paths[index]));
            }
        }
    });
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows: tableRows,
        prepareRow,
        toggleAllRowsExpanded
    } = useTable(
        {
            columns: columnData.allColumnData,
            data: rows
        },
        useRowSelection(reactTableSelectors.rowSelector, reactTableActions.rowSelection),
        useSort(reactTableSelectors.sortSelector, reactTableActions.sort),
        useExpanded
    );

    useEffect(() => {
        if (selection.length > 0) {
            const toRemove = selection.filter(path => paths.indexOf(path) === -1);
            if (toRemove.length > 0) {
                dispatch(reduxActions.removeSelectionAction(toRemove));
            }
        }
    }, [rows, selection, dispatch, reduxActions, paths]);

    const isStructuredView = JContentConstants.tableView.viewMode.STRUCTURED === tableView.viewMode;

    useEffect(() => {
        if (isStructuredView) {
            toggleAllRowsExpanded(true);
        }
    }, [rows, isStructuredView, toggleAllRowsExpanded]);

    const contextualMenus = useRef({});

    let colData = previewState === CM_DRAWER_STATES.SHOW ? columnData.reducedColumnData : columnData.allColumnData;
    let isPreviewOpened = previewState === CM_DRAWER_STATES.SHOW;

    if (isContentNotFound) {
        return <ContentNotFound columnSpan={colData.length} t={t}/>;
    }

    const typeSelector = mode === JContentConstants.mode.PAGES && dataCounts ? <ContentTypeSelector contentCount={dataCounts.contents} pagesCount={dataCounts.pages}/> : null;

    if (_.isEmpty(rows) && !isLoading) {
        if ((mode === JContentConstants.mode.SEARCH || mode === JContentConstants.mode.SQL2SEARCH)) {
            return <EmptyTable columnSpan={colData.length} t={t}/>;
        }

        return (
            <>
                {typeSelector}
                {isAllowUpload ? <ContentListEmptyDropZone mode={mode} path={path}/> : <EmptyTable columnSpan={colData.length} t={t}/>}
            </>
        );
    }

    const Transform = isAllowUpload ? UploadTransformComponent : ContentTableWrapper;
    const props = isAllowUpload ? {
        uploadTargetComponent: ContentTableWrapper,
        uploadPath: path,
        mode: mode
    } : {};

    const doubleClickNavigation = (node, siteKey, mode) => {
        let newMode = mode;
        if (mode === JContentConstants.mode.SEARCH) {
            if (node.path.indexOf('/files') > -1) {
                newMode = JContentConstants.mode.MEDIA;
            } else if (node.path.indexOf('/contents') > -1) {
                newMode = JContentConstants.mode.CONTENT_FOLDERS;
            } else {
                newMode = JContentConstants.mode.PAGES;
            }

            dispatch(reduxActions.setModeAction(mode));
        }

        dispatch(reduxActions.setPathAction(siteKey, node.path, newMode, {sub: node.primaryNodeType.name !== 'jnt:page' && node.primaryNodeType.name !== 'jnt:contentFolder'}));
    };

    return (
        <>
            {typeSelector}
            <Transform reference={mainPanelRef}
                       onKeyDown={handleKeyboardNavigation}
                       onClick={setFocusOnMainContainer}
                       {...props}
            >
                <Table aria-labelledby="tableTitle"
                       data-cm-role="table-content-list"
                       style={{width: '100%', minWidth: '1100px'}}
                       {...getTableProps()}
                >
                    <ContentListHeader headerGroups={headerGroups}/>
                    <TableBody {...getTableBodyProps()}>
                        {tableRows.map((row, index) => {
                            prepareRow(row);
                            const rowProps = row.getRowProps();
                            const node = row.original;
                            const isSelected = node.path === previewSelection && isPreviewOpened;
                            contextualMenus.current[node.path] = contextualMenus.current[node.path] || React.createRef();

                            const openContextualMenu = event => {
                                contextualMenus.current[node.path].current(event);
                            };

                            return (
                                <TableRow key={'row' + row.id}
                                          {...rowProps}
                                          data-cm-role="table-content-list-row"
                                          className={css.tableRow}
                                          isHighlighted={isSelected}
                                          onClick={() => {
                                              if (isPreviewOpened && !node.notSelectableForPreview) {
                                                  setSelectedItemIndex(index);
                                                  dispatch(reduxActions.onPreviewSelectAction(paths[index]));
                                              }
                                          }}
                                          onContextMenu={event => {
                                                            event.stopPropagation();
                                                            openContextualMenu(event);
                                                        }}
                                          onDoubleClick={allowDoubleClickNavigation(
                                              node.primaryNodeType.name,
                                              node.subNodes ? node.subNodes.pageInfo.totalCount : null,
                                              () => doubleClickNavigation(node, siteKey, mode)
                                          )}
                                >
                                    <ContextualMenu
                                        setOpenRef={contextualMenus.current[node.path]}
                                        actionKey={ctxMenuActionKey(node, selection)}
                                        path={selection.length === 0 || selection.indexOf(node.path) === -1 ? node.path : null}
                                        paths={selection.length === 0 || selection.indexOf(node.path) === -1 ? null : selection}
                                    />
                                    {row.cells.map(cell => <React.Fragment key={cell.column.id}>{cell.render('Cell')}</React.Fragment>)}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Transform>
            {(!isStructuredView || isInSearchMode(mode) || JContentConstants.mode.MEDIA === mode) &&
            <TablePagination totalNumberOfRows={totalCount}
                             currentPage={pagination.currentPage + 1}
                             rowsPerPage={pagination.pageSize}
                             label={{
                                 rowsPerPage: t('jcontent:label.pagination.rowsPerPage'),
                                 of: t('jcontent:label.pagination.of')
                             }}
                             rowsPerPageOptions={[10, 25, 50, 100]}
                             onPageChange={page => dispatch(reduxActions.setCurrentPageAction(page))}
                             onRowsPerPageChange={size => dispatch(reduxActions.setPageSizeAction(size))}
            />}
        </>
    );
};

const selector = state => ({
    mode: state.jcontent.mode,
    previewSelection: state.jcontent.previewSelection,
    siteKey: state.site,
    path: state.jcontent.path,
    pagination: state.jcontent.pagination,
    previewState: state.jcontent.previewState,
    selection: state.jcontent.selection,
    tableView: state.jcontent.tableView
});

const rowSelector = state => ({selection: state.jcontent.selection});
const sortSelector = state => state.jcontent.sort;

ContentTable.propTypes = {
    isContentNotFound: PropTypes.bool,
    isLoading: PropTypes.bool,
    isAllowUpload: PropTypes.bool,
    rows: PropTypes.array.isRequired,
    totalCount: PropTypes.number.isRequired,
    dataCounts: PropTypes.object,
    ctxMenuActionKey: PropTypes.func,
    selector: PropTypes.func,
    reduxActions: PropTypes.shape({
        onPreviewSelectAction: PropTypes.func.isRequired,
        setPathAction: PropTypes.func.isRequired,
        setModeAction: PropTypes.func.isRequired,
        setCurrentPageAction: PropTypes.func.isRequired,
        setPageSizeAction: PropTypes.func.isRequired,
        removeSelectionAction: PropTypes.func.isRequired
    }),
    columnData: PropTypes.shape({
        allColumnData: PropTypes.array.isRequired,
        reducedColumnData: PropTypes.array.isRequired
    }),
    reactTableSelectors: {
        rowSelector: PropTypes.func.isRequired,
        sortSelector: PropTypes.func.isRequired
    },
    reactTableActions: {
        rowSelection: {
            switchSelectionAction: PropTypes.func.isRequired,
            removeSelectionAction: PropTypes.func.isRequired,
            addSelectionAction: PropTypes.func.isRequired
        },
        sort: {
            setSortAction: PropTypes.func.isRequired
        }
    },
    ContentTypeSelector: PropTypes.element
};

ContentTable.defaultProps = {
    ctxMenuActionKey: (node, selection) => selection.length === 0 || selection.indexOf(node.path) === -1 ? 'contentMenu' : 'selectedContentMenu',
    selector: selector,
    isAllowUpload: true,
    reduxActions: {
        onPreviewSelectAction: previewSelection => cmSetPreviewSelection(previewSelection),
        setPathAction: (siteKey, path, mode, params) => (batchActions([cmOpenPaths(extractPaths(siteKey, path, mode)), cmGoto({path, params})])),
        setModeAction: mode => cmGoto({mode}),
        setCurrentPageAction: page => cmSetPage(page - 1),
        setPageSizeAction: pageSize => cmSetPageSize(pageSize),
        removeSelectionAction: path => cmRemoveSelection(path)
    },
    columnData: {
        allColumnData: allColumnData,
        reducedColumnData: reducedColumnData
    },
    reactTableSelectors: {
        rowSelector: rowSelector,
        sortSelector: sortSelector
    },
    reactTableActions: {
        rowSelection: {
            switchSelectionAction: p => cmSwitchSelection(p),
            removeSelectionAction: p => cmRemoveSelection(p),
            addSelectionAction: p => cmAddSelection(p)
        },
        sort: {
            setSortAction: s => cmSetSort(s)
        }
    },
    ContentTypeSelector: ContentTypeSelector
};

export default ContentTable;
