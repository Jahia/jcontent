/* eslint-disable no-unused-vars */
import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {ContextualMenu} from '@jahia/ui-extender';
import * as _ from 'lodash';
import {useTranslation} from 'react-i18next';
import {CM_DRAWER_STATES, cmGoto, cmOpenPaths} from '../../../JContent.redux';
import {
    allowDoubleClickNavigation,
    extractPaths,
    getDefaultLocale,
    isMarkedForDeletion,
    isWorkInProgress
} from '../../../JContent.utils';
import {connect} from 'react-redux';
import {compose} from '~/utils';
import UploadTransformComponent from '../UploadTransformComponent';
import {cmSetPreviewSelection} from '../../../preview.redux';
import {cmSetSort} from '../sort.redux';
import {cmSetPage, cmSetPageSize} from '../pagination.redux';
import {cmAddSelection, cmRemoveSelection, cmSwitchSelection} from '../contentSelection.redux';
import JContentConstants from '../../../JContent.constants';
import ContentListEmptyDropZone from './ContentListEmptyDropZoneMoon';
import ContentNotFound from './ContentNotFoundMoon';
import EmptyTable from './EmptyTableMoon';
import {Table, TableBody, TableRow} from '@jahia/moonstone';
import {useTable, useFlexLayout, useExpanded} from 'react-table';
import {useRowSelection} from './reactTable/plugins';
import {useSort} from './reactTable/plugins';
import ContentListHeader from './ContentListHeader/ContentListHeaderMoon';
import css from './ContentListTableMoon.scss';
import {allColumnData, reducedColumnData} from './reactTable/columns';
import ContentListTableWrapper from './ContentListTableWrapper';

const adaptedRows = rows => (rows.map(r => ({
    ...r,
    name: r.displayName,
    type: r.primaryNodeType.displayName,
    createdBy: r.createdBy.value,
    lastModified: r.lastModified.value
})));

export const ContentListTable = ({
    setPath,
    mode,
    siteKey,
    setMode,
    rows,
    selection,
    removeSelection,
    contentNotFound,
    pagination,
    sort,
    setCurrentPage,
    setPageSize,
    onPreviewSelect,
    previewSelection,
    totalCount,
    classes,
    uilang,
    setSort,
    path,
    previewState,
    lang,
    switchSelection,
    addSelection,
    loading}) => {
    const {t} = useTranslation();
    const data = React.useMemo(() => adaptedRows(rows), [rows]);
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows: tableRows,
        prepareRow,
        toggleAllRowsExpanded,
        isAllRowsExpanded
    } = useTable(
        {
            columns: allColumnData,
            data: data
        },
        useRowSelection,
        useSort,
        useExpanded,
        useFlexLayout
    );

    useEffect(() => {
        if (selection.length > 0) {
            const paths = rows.map(node => node.path);
            const toRemove = selection.filter(path => paths.indexOf(path) === -1);
            if (toRemove.length > 0) {
                removeSelection(toRemove);
            }
        }
    }, [rows, selection, removeSelection]);

    useEffect(() => {
        if (!isAllRowsExpanded) {
            toggleAllRowsExpanded();
        }
    });

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

    if (_.isEmpty(rows) && !loading) {
        if ((mode === JContentConstants.mode.SEARCH || mode === JContentConstants.mode.SQL2SEARCH)) {
            return <EmptyTable columnSpan={columnData.length} t={t}/>;
        }

        return <ContentListEmptyDropZone mode={mode} path={path}/>;
    }

    return (
        <>
            <ContentListTableWrapper rows={rows} onPreviewSelect={onPreviewSelect}>
                <Table aria-labelledby="tableTitle" data-cm-role="table-content-list" {...getTableProps()} style={{width: '100%'}}>
                    <ContentListHeader headerGroups={headerGroups}/>
                    <UploadTransformComponent uploadTargetComponent={TableBody}
                                              uploadPath={path}
                                              mode={mode}
                                              {...getTableBodyProps()}
                    >
                        {tableRows.map(row => {
                            prepareRow(row);
                            const rowProps = row.getRowProps();
                            const node = row.original;
                            contextualMenus.current[node.path] = contextualMenus.current[node.path] || React.createRef();

                            const openContextualMenu = event => {
                                contextualMenus.current[node.path].current(event);
                            };

                            return (
                                <TableRow key={'row' + row.id}
                                          {...rowProps}
                                          data-cm-role="table-content-list-row"
                                          className={css.tableRow}
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
            </ContentListTableWrapper>
        </>
    );
};

const mapStateToProps = state => ({
    mode: state.jcontent.mode,
    previewSelection: state.jcontent.previewSelection,
    uilang: state.uilang,
    siteKey: state.site,
    path: state.jcontent.path,
    lang: state.language,
    params: state.jcontent.params,
    searchTerms: state.jcontent.params.searchTerms,
    searchContentType: state.jcontent.params.searchContentType,
    sql2SearchFrom: state.jcontent.params.sql2SearchFrom,
    sql2SearchWhere: state.jcontent.params.sql2SearchWhere,
    pagination: state.jcontent.pagination,
    sort: state.jcontent.sort,
    previewState: state.jcontent.previewState,
    selection: state.jcontent.selection
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
    setSort: state => dispatch(cmSetSort(state)),
    clearSearch: params => {
        params = _.clone(params);
        _.unset(params, 'searchContentType');
        _.unset(params, 'searchTerms');
        _.unset(params, 'sql2SearchFrom');
        _.unset(params, 'sql2SearchWhere');
        dispatch(cmGoto({mode: JContentConstants.mode.CONTENT_FOLDERS, params: params}));
    },
    switchSelection: path => dispatch(cmSwitchSelection(path)),
    addSelection: path => dispatch(cmAddSelection(path)),
    removeSelection: path => dispatch(cmRemoveSelection(path))
});

ContentListTable.propTypes = {
    addSelection: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    contentNotFound: PropTypes.bool,
    lang: PropTypes.string.isRequired,
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
    setSort: PropTypes.func.isRequired,
    siteKey: PropTypes.string.isRequired,
    sort: PropTypes.object.isRequired,
    switchSelection: PropTypes.func.isRequired,
    totalCount: PropTypes.number.isRequired,
    uilang: PropTypes.string.isRequired
};

export default compose(
    connect(mapStateToProps, mapDispatchToProps)
)(ContentListTable);
