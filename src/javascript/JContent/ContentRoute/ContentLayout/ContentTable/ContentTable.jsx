import React, {useEffect, useMemo, useRef} from 'react';
import PropTypes from 'prop-types';
import {ContextualMenu, registry} from '@jahia/ui-extender';
import {useTranslation} from 'react-i18next';
import {CM_DRAWER_STATES, cmCloseTablePaths, cmGoto, cmOpenPaths, cmOpenTablePaths} from '~/JContent/JContent.redux';
import {allowDoubleClickNavigation, extractPaths, getCanDisplayItemParams} from '~/JContent/JContent.utils';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import UploadTransformComponent from '../UploadTransformComponent';
import {cmSetPreviewSelection} from '~/JContent/preview.redux';
import {cmSetPage, cmSetPageSize} from '../pagination.redux';
import {cmRemoveSelection} from '../contentSelection.redux';
import JContentConstants from '~/JContent/JContent.constants';
import ContentListEmptyDropZone from './ContentEmptyDropZone';
import ContentNotFound from './ContentNotFound';
import EmptyTable from './EmptyTable';
import {Table, TableBody, TablePagination, TableRow} from '@jahia/moonstone';
import {useTable} from 'react-table';
import {useExpandedControlled, useRowSelection, useSort} from './reactTable/plugins';
import ContentListHeader from './ContentListHeader/ContentListHeader';
import css from './ContentTable.scss';
import {allColumnData, reducedColumnData} from './reactTable/columns';
import ContentTableWrapper from './ContentTableWrapper';
import {flattenTree, isInSearchMode} from '../ContentLayout.utils';
import {useKeyboardNavigation} from '../useKeyboardNavigation';
import {cmSetSort} from '~/JContent/ContentRoute/ContentLayout/sort.redux';

export const ContentTable = ({rows, isContentNotFound, totalCount, isLoading, isStructured}) => {
    const {t} = useTranslation('jcontent');
    const dispatch = useDispatch();

    const {mode, previewSelection, siteKey, path, pagination, previewState, selection, searchTerms, tableOpenPaths, sort} = useSelector(state => ({
        mode: state.jcontent.mode,
        previewSelection: state.jcontent.previewSelection,
        siteKey: state.site,
        path: state.jcontent.path,
        pagination: state.jcontent.pagination,
        previewState: state.jcontent.previewState,
        selection: state.jcontent.selection,
        tableView: state.jcontent.tableView,
        searchTerms: state.jcontent.params.searchTerms,
        tableOpenPaths: state.jcontent.tableOpenPaths,
        sort: state.jcontent.sort
    }), shallowEqual);

    const onPreviewSelect = previewSelection => dispatch(cmSetPreviewSelection(previewSelection));
    const setPath = (siteKey, path, mode, params) => {
        dispatch(cmOpenPaths(extractPaths(siteKey, path, mode)));
        dispatch(cmGoto({path, params}));
    };

    const setMode = mode => dispatch(cmGoto({mode}));
    const setCurrentPage = page => dispatch(cmSetPage(page - 1));
    const setPageSize = pageSize => dispatch(cmSetPageSize(pageSize));

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
                onPreviewSelect(paths[index]);
            }
        }
    });
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows: tableRows,
        prepareRow
    } = useTable(
        {
            columns: allColumnData,
            data: rows,
            isExpanded: row => tableOpenPaths.indexOf(row.path) > -1,
            onExpand: (id, value) => {
                const node = id.split('.').reduce((p, i) => p.subRows[i], {subRows: rows});
                if (value === false) {
                    dispatch(cmCloseTablePaths([node.path]));
                } else {
                    dispatch(cmOpenTablePaths([node.path]));
                }
            },
            sort,
            onSort: (column, order) => {
                dispatch(cmSetSort({order, orderBy: column.property}));
            }
        },
        useRowSelection,
        useSort,
        useExpandedControlled
    );

    useEffect(() => {
        const removeSelection = path => dispatch(cmRemoveSelection(path));

        if (selection.length > 0) {
            const toRemove = selection.filter(path => paths.indexOf(path) === -1);
            if (toRemove.length > 0) {
                removeSelection(toRemove);
            }
        }
    }, [rows, selection, dispatch, paths]);

    const contextualMenus = useRef({});

    const doubleClickNavigation = node => {
        let newMode = mode;
        if (mode === JContentConstants.mode.SEARCH) {
            const params = getCanDisplayItemParams(node);
            newMode = registry.find({type: 'accordionItem', target: 'jcontent'}).find(acc => acc.canDisplayItem && acc.canDisplayItem(params))?.key;
            if (newMode) {
                setMode(newMode);
            }
        }

        setPath(siteKey, node.path, newMode, {sub: node.primaryNodeType.name !== 'jnt:page' && node.primaryNodeType.name !== 'jnt:contentFolder'});
    };

    let columnData = previewState === CM_DRAWER_STATES.SHOW ? reducedColumnData : allColumnData;
    let isPreviewOpened = previewState === CM_DRAWER_STATES.SHOW;

    if (isContentNotFound) {
        return <ContentNotFound columnSpan={columnData.length} t={t}/>;
    }

    const tableHeader = registry.get('accordionItem', mode)?.tableConfig?.tableHeader;

    if (!rows?.length && !isLoading) {
        if ((mode === JContentConstants.mode.SEARCH || mode === JContentConstants.mode.SQL2SEARCH)) {
            return <EmptyTable text={searchTerms}/>;
        }

        return (
            <>
                {tableHeader}
                <ContentListEmptyDropZone mode={mode} path={path}/>
            </>
        );
    }

    return (
        <>
            {tableHeader}
            <UploadTransformComponent uploadTargetComponent={ContentTableWrapper}
                                      uploadPath={path}
                                      mode={mode}
                                      reference={mainPanelRef}
                                      onKeyDown={handleKeyboardNavigation}
                                      onClick={setFocusOnMainContainer}
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
                                                  onPreviewSelect(node.path);
                                              }
                                          }}
                                          onContextMenu={event => {
                                                            event.stopPropagation();
                                                            openContextualMenu(event);
                                                        }}
                                          onDoubleClick={allowDoubleClickNavigation(
                                              node.primaryNodeType.name,
                                              node.subNodes ? node.subNodes.pageInfo.totalCount : null,
                                              () => doubleClickNavigation(node)
                                          )}
                                >
                                    <ContextualMenu
                                        setOpenRef={contextualMenus.current[node.path]}
                                        actionKey={selection.length === 0 || selection.indexOf(node.path) === -1 ? 'contentMenu' : 'selectedContentMenu'}
                                        path={selection.length === 0 || selection.indexOf(node.path) === -1 ? node.path : null}
                                        paths={selection.length === 0 || selection.indexOf(node.path) === -1 ? null : selection}
                                    />
                                    {row.cells.map(cell => <React.Fragment key={cell.column.id}>{cell.render('Cell')}</React.Fragment>)}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </UploadTransformComponent>
            {(!isStructured || isInSearchMode(mode) || JContentConstants.mode.MEDIA === mode) &&
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
            />}
        </>
    );
};

ContentTable.propTypes = {
    isContentNotFound: PropTypes.bool,
    isLoading: PropTypes.bool,
    isStructured: PropTypes.bool,
    rows: PropTypes.array.isRequired,
    totalCount: PropTypes.number.isRequired
};

export default ContentTable;
