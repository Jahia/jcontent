import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {Badge, Tooltip, withStyles} from '@material-ui/core';
import {Lock} from '@material-ui/icons';
import {Folder, Wrench} from 'mdi-material-ui';
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
import classNames from 'classnames';
import {cmSetPreviewSelection} from '../../../preview.redux';
import {cmSetSort} from '../sort.redux';
import {cmSetPage, cmSetPageSize} from '../pagination.redux';
import {cmAddSelection, cmRemoveSelection, cmSwitchSelection} from '../contentSelection.redux';
import JContentConstants from '../../../JContent.constants';
import ContentListEmptyDropZone from './ContentListEmptyDropZone';
import ContentNotFound from './ContentNotFound';
import EmptyTable from './EmptyTable';
import {DocumentIcon, FileIcon, ImageIcon, ZipIcon} from '../icons';
import {useKeyboardNavigation} from '../useKeyboardNavigation';
import {Table, TablePagination, TableBody, TableRow, TableBodyCell} from '@jahia/moonstone';
import {useTable} from 'react-table';
import {useRowSelection} from './reactTable/plugins';
import ContentListHeader from './ContentListHeader/ContentListHeaderMoon';
import css from './ContentListTableMoon.scss';
import {allColumnData} from './reactTable/columns';

const reducedColumnData = [
    {
        id: 'name',
        label: 'jcontent:label.contentManager.listColumns.name',
        sortable: true,
        property: 'displayName'
    },
    {
        id: 'wip',
        label: '',
        sortable: false,
        property: ''
    },
    {
        id: 'lock',
        label: '',
        sortable: false,
        property: ''
    },
    {
        id: 'createdBy',
        label: 'jcontent:label.contentManager.listColumns.createdBy',
        sortable: true,
        property: 'createdBy.value'
    },
    {
        id: 'lastModified',
        label: 'jcontent:label.contentManager.listColumns.lastModified',
        sortable: true,
        property: 'lastModified.value'
    }
];

const adaptedRows = rows => (rows.map(r => ({
    ...r,
    name: r.displayName,
    type: r.primaryNodeType.displayName,
    createdBy: r.createdBy.value,
    lastModified: r.lastModified.value
})));

const getCellClasses = (node, classes, column, isSelected, isPreviewOpened) => {
    let selected = isSelected && isPreviewOpened;
    return {
        root: classNames(
            classes.cell,
            classes[column + 'Cell'],
            {
                [classes.selectedCell]: selected,
                [classes[column + 'CellPreviewOpened']]: isPreviewOpened,
                [classes[column + 'CellSelected']]: selected,
                [classes.isDeleted]: isMarkedForDeletion(node)
            }
        )
    };
};

const addIconSuffix = icon => {
    return (icon.includes('.png') ? icon : icon + '.png');
};

const getMediaIcon = (node, classes) => {
    switch (node.primaryNodeType.name) {
        case 'jnt:folder':
            return <Folder className={classes.icon}/>;
        case 'jnt:file':
            if (node.mixinTypes.length !== 0 && !_.isEmpty(node.mixinTypes.filter(mixin => mixin.name === 'jmix:image'))) {
                return <ImageIcon className={classes.icon}/>;
            }

            if (node.name.match(/.zip$/g) || node.name.match(/.tar$/g) || node.name.match(/.rar$/g)) {
                return <ZipIcon className={classes.icon}/>;
            }

            if (node.mixinTypes.length !== 0 && !_.isEmpty(node.mixinTypes.filter(mixin => mixin.name === 'jmix:document'))) {
                return <DocumentIcon className={classes.icon}/>;
            }

            return <FileIcon className={classes.icon}/>;
        default:
            return <img src={addIconSuffix(node.primaryNodeType.icon)}/>;
    }
};

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
    cellReplacement,
    loading}) => {
    const {t} = useTranslation();
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows: tableRows,
        prepareRow
    } = useTable({columns: allColumnData, data: adaptedRows(rows)}, useRowSelection);

    const {
        mainPanelRef,
        handleKeyboardNavigation,
        setFocusOnMainContainer,
        setSelectedItemIndex
    } = useKeyboardNavigation({
        listLength: rows.length,
        onSelectionChange: index => onPreviewSelect(rows[index].path)
    });

    useEffect(() => {
        if (selection.length > 0) {
            const paths = rows.map(node => node.path);
            const toRemove = selection.filter(path => paths.indexOf(path) === -1);
            if (toRemove.length > 0) {
                removeSelection(toRemove);
            }
        }
    }, [rows, selection, removeSelection]);

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

    return (
        <>
            <div ref={mainPanelRef}
                 className={css.tableWrapper}
                 tabIndex="1"
                 onKeyDown={handleKeyboardNavigation}
                 onClick={setFocusOnMainContainer}
            >
                <Table {...getTableProps()}>
                    <ContentListHeader
                        headerGroups={headerGroups}
                    />
                    <TableBody {...getTableBodyProps()}>
                        {tableRows.map(row => {
                            prepareRow(row);
                            const rowProps = row.getRowProps();
                            return (
                                // This rerenders all the rows :(
                                // <TableRow key={'row' + row.id} {...row.getRowProps()} onMouseEnter={() => table.setRowState(row.id, {over: true})} onMouseLeave={() => table.setRowState(row.id, {over: false})}>
                                <TableRow key={'row' + row.id} {...rowProps} className={css.tableCell}>
                                    {row.cells.map((cell, index) => {
                                        return (
                                            // tslint:disable-next-line
                                            <TableBodyCell key={row.id + index}{...cell.getCellProps()}>
                                                {cell.render('Cell')}
                                            </TableBodyCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
            <TablePagination totalNumberOfRows={totalCount}
                             currentPage={pagination.currentPage + 1}
                             rowsPerPage={pagination.pageSize}
                             label={{
                              rowsPerPage: t('jcontent:label.pagination.rowsPerPage'),
                              of: t('jcontent:label.pagination.of')
                          }}
                             onPageChange={setCurrentPage}
                             onRowsPerPageChange={setPageSize}
            />
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
