import React, {useEffect, useMemo, useRef} from 'react';
import PropTypes from 'prop-types';
import {ContextualMenu} from '@jahia/ui-extender';
import * as _ from 'lodash';
import {useTranslation} from 'react-i18next';
import {CM_DRAWER_STATES, cmGoto, cmOpenPaths} from '../../../JContent.redux';
import {
    allowDoubleClickNavigation,
    extractPaths
} from '../../../JContent.utils';
import {connect} from 'react-redux';
import {compose} from '~/utils';
import UploadTransformComponent from '../UploadTransformComponent';
import {cmSetPreviewSelection} from '../../../preview.redux';
import {cmSetPage, cmSetPageSize} from '../pagination.redux';
import {cmRemoveSelection} from '../contentSelection.redux';
import JContentConstants from '../../../JContent.constants';
import ContentListEmptyDropZone from './ContentEmptyDropZone';
import ContentNotFound from './ContentNotFound';
import EmptyTable from './EmptyTable';
import {Table, TableBody, TablePagination, TableRow} from '@jahia/moonstone';
import {useTable, useFlexLayout, useExpanded} from 'react-table';
import {useRowSelection} from './reactTable/plugins';
import {useSort} from './reactTable/plugins';
import ContentListHeader from './ContentListHeader/ContentListHeader';
import css from './ContentTable.scss';
import {allColumnData, reducedColumnData} from './reactTable/columns';
import ContentTableWrapper from './ContentTableWrapper';
import {flattenTree} from '../ContentLayout.utils';
import ContentTypeSelector from './ContentTypeSelector';
import {useKeyboardNavigation} from '../useKeyboardNavigation';

export const ContentTable = ({
    setPath,
    mode,
    siteKey,
    setMode,
    rows,
    selection,
    removeSelection,
    contentNotFound,
    pagination,
    setCurrentPage,
    setPageSize,
    onPreviewSelect,
    previewSelection,
    totalCount,
    path,
    previewState,
    tableView,
    dataCounts,
    loading}) => {
    const isStructuredView = JContentConstants.tableView.viewMode.STRUCTURED === tableView.viewMode;
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
                onPreviewSelect(paths[index]);
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
            columns: allColumnData,
            data: rows
        },
        useRowSelection,
        useSort,
        useExpanded,
        useFlexLayout
    );

    useEffect(() => {
        if (selection.length > 0) {
            const toRemove = selection.filter(path => paths.indexOf(path) === -1);
            if (toRemove.length > 0) {
                removeSelection(toRemove);
            }
        }
    }, [rows, selection, removeSelection]);

    useEffect(() => {
        if (isStructuredView) {
            toggleAllRowsExpanded(true);
        }
    }, [rows]);

    const contextualMenus = useRef({});

    const doubleClickNavigation = node => {
        let newMode = mode;
        if (mode === JContentConstants.mode.SEARCH) {
            if (node.path.indexOf('/files') !== -1) {
                newMode = JContentConstants.mode.MEDIA;
            } else if (node.path.indexOf('/contents') !== -1) {
                newMode = JContentConstants.mode.CONTENT_FOLDERS;
            } else {
                newMode = JContentConstants.mode.PAGES;
            }

            setMode(newMode);
        }

        setPath(siteKey, node.path, newMode, {sub: node.primaryNodeType.name !== 'jnt:page' && node.primaryNodeType.name !== 'jnt:contentFolder'});
    };

    let columnData = previewState === CM_DRAWER_STATES.SHOW ? reducedColumnData : allColumnData;
    let isPreviewOpened = previewState === CM_DRAWER_STATES.SHOW;

    if (contentNotFound) {
        return <ContentNotFound columnSpan={columnData.length} t={t}/>;
    }

    const typeSelector = isStructuredView && mode === JContentConstants.mode.PAGES && dataCounts ? <ContentTypeSelector contentCount={dataCounts.contents} pagesCount={dataCounts.pages}/> : null;

    if (_.isEmpty(rows) && !loading) {
        if ((mode === JContentConstants.mode.SEARCH || mode === JContentConstants.mode.SQL2SEARCH)) {
            return <EmptyTable columnSpan={columnData.length} t={t}/>;
        }

        return (
            <>
                {typeSelector}
                <ContentListEmptyDropZone mode={mode} path={path}/>;
            </>
        );
    }

    return (
        <>
            {typeSelector}
            <ContentTableWrapper reference={mainPanelRef}
                                 onKeyDown={handleKeyboardNavigation}
                                 onClick={setFocusOnMainContainer}
            >
                <Table aria-labelledby="tableTitle" data-cm-role="table-content-list" {...getTableProps()} style={{width: '100%'}}>
                    <ContentListHeader headerGroups={headerGroups}/>
                    <UploadTransformComponent uploadTargetComponent={TableBody}
                                              uploadPath={path}
                                              mode={mode}
                                              {...getTableBodyProps()}
                    >
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
                                              () => {
                                                  doubleClickNavigation(node);
                                              })}
                                >
                                    <ContextualMenu
                                        setOpenRef={contextualMenus.current[node.path]}
                                        actionKey={selection.length === 0 || selection.indexOf(node.path) === -1 ? 'contentMenu' : 'selectedContentMenu'}
                                        path={selection.length === 0 || selection.indexOf(node.path) === -1 ? node.path : null}
                                        paths={selection.length === 0 || selection.indexOf(node.path) === -1 ? null : selection}
                                    />
                                    {row.cells.map(cell => cell.render('Cell'))}
                                </TableRow>
                            );
                        })}
                    </UploadTransformComponent>
                </Table>
            </ContentTableWrapper>
            {!isStructuredView &&
            <TablePagination totalNumberOfRows={totalCount}
                             currentPage={pagination.currentPage + 1}
                             rowsPerPage={pagination.pageSize}
                             label={{
                                 rowsPerPage: t('jcontent:label.pagination.rowsPerPage'),
                                 of: t('jcontent:label.pagination.of')
                             }}
                             onPageChange={setCurrentPage}
                             onRowsPerPageChange={setPageSize}
            />}
        </>
    );
};

const mapStateToProps = state => ({
    mode: state.jcontent.mode,
    previewSelection: state.jcontent.previewSelection,
    siteKey: state.site,
    path: state.jcontent.path,
    params: state.jcontent.params,
    searchTerms: state.jcontent.params.searchTerms,
    searchContentType: state.jcontent.params.searchContentType,
    sql2SearchFrom: state.jcontent.params.sql2SearchFrom,
    sql2SearchWhere: state.jcontent.params.sql2SearchWhere,
    pagination: state.jcontent.pagination,
    sort: state.jcontent.sort,
    previewState: state.jcontent.previewState,
    selection: state.jcontent.selection,
    tableView: state.jcontent.tableView
});

const mapDispatchToProps = dispatch => ({
    onPreviewSelect: previewSelection => dispatch(cmSetPreviewSelection(previewSelection)),
    setPath: (siteKey, path, mode, params) => {
        dispatch(cmOpenPaths(extractPaths(siteKey, path, mode)));
        dispatch(cmGoto({path, params}));
    },
    setMode: mode => dispatch(cmGoto({mode})),
    setCurrentPage: page => dispatch(cmSetPage(page - 1)),
    setPageSize: pageSize => dispatch(cmSetPageSize(pageSize)),
    clearSearch: params => {
        params = _.clone(params);
        _.unset(params, 'searchContentType');
        _.unset(params, 'searchTerms');
        _.unset(params, 'sql2SearchFrom');
        _.unset(params, 'sql2SearchWhere');
        dispatch(cmGoto({mode: JContentConstants.mode.CONTENT_FOLDERS, params: params}));
    },
    removeSelection: path => dispatch(cmRemoveSelection(path))
});

ContentTable.propTypes = {
    contentNotFound: PropTypes.bool,
    loading: PropTypes.bool,
    mode: PropTypes.string.isRequired,
    onPreviewSelect: PropTypes.func.isRequired,
    pagination: PropTypes.object.isRequired,
    path: PropTypes.string.isRequired,
    previewSelection: PropTypes.string,
    previewState: PropTypes.number.isRequired,
    removeSelection: PropTypes.func.isRequired,
    rows: PropTypes.array.isRequired,
    selection: PropTypes.array.isRequired,
    setCurrentPage: PropTypes.func.isRequired,
    setPageSize: PropTypes.func.isRequired,
    setPath: PropTypes.func.isRequired,
    setMode: PropTypes.func.isRequired,
    siteKey: PropTypes.string.isRequired,
    tableView: PropTypes.object.isRequired,
    switchSelection: PropTypes.func.isRequired,
    totalCount: PropTypes.number.isRequired,
    dataCounts: PropTypes.object
};

export default compose(
    connect(mapStateToProps, mapDispatchToProps)
)(ContentTable);
