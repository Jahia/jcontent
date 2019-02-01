import React from 'react';
import {
    Checkbox,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Tooltip,
    Typography,
    withStyles
} from '@material-ui/core';
import {Lock} from '@material-ui/icons';
import {Wrench} from 'mdi-material-ui';
import ContentListHeader from './ContentListHeader';
import {ContextualMenu, DisplayAction, DisplayActions, iconButtonRenderer, Pagination} from '@jahia/react-material';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import {translate} from 'react-i18next';
import DxContext from '../../DxContext';
import PublicationStatus from '../../PublicationStatus';
import Moment from 'react-moment';
import {CM_DRAWER_STATES, cmGoto, cmOpenPaths} from '../../ContentManager.redux-actions';
import {allowDoubleClickNavigation, extractPaths, isMarkedForDeletion} from '../../ContentManager.utils';
import ToolBar from '../ToolBar';
import {connect} from 'react-redux';
import {compose} from 'react-apollo';
import UploadTransformComponent from '../UploadTransformComponent';
import classNames from 'classnames';
import {cmSetPreviewSelection} from '../../preview.redux-actions';
import {cmSetSort} from '../sort.redux-actions';
import {cmSetPage, cmSetPageSize} from '../pagination.redux-actions';
import {cmAddSelection, cmRemoveSelection, cmSwitchSelection} from '../contentSelection.redux-actions';
import EmptyDropZone from '../EmptyDropZone/EmptyDropZone';
import ContentManagerConstants from '../../ContentManager.constants';

const allColumnData = [
    {
        id: 'name',
        label: 'label.contentManager.listColumns.name',
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
        id: 'type',
        label: 'label.contentManager.listColumns.type',
        sortable: true,
        property: 'primaryNodeType.displayName'
    },
    {
        id: 'createdBy',
        label: 'label.contentManager.listColumns.createdBy',
        sortable: true,
        property: 'createdBy.value'
    },
    {
        id: 'lastModified',
        label: 'label.contentManager.listColumns.lastModified',
        sortable: true,
        property: 'lastModified.value'
    }
];

const reducedColumnData = [
    {
        id: 'name',
        label: 'label.contentManager.listColumns.name',
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
        label: 'label.contentManager.listColumns.createdBy',
        sortable: true,
        property: 'createdBy.value'
    },
    {
        id: 'lastModified',
        label: 'label.contentManager.listColumns.lastModified',
        sortable: true,
        property: 'lastModified.value'
    }
];

const APP_TABLE_CELLS = 2;

const styles = theme => ({
    tableWrapper: {
        minHeight: 'calc(100vh - ' + (theme.layout.topBarHeight + theme.contentManager.toolbarHeight + theme.contentManager.paginationHeight) + 'px)',
        maxHeight: 'calc(100vh - ' + (theme.layout.topBarHeight + theme.contentManager.toolbarHeight + theme.contentManager.paginationHeight) + 'px)',
        overflow: 'auto',
        position: 'relative'
    },
    row: {
        '&&:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.default + '7F'
        },
        '&&:hover': {
            backgroundColor: theme.palette.background.default
        }
    },
    rowShowActions: {
        '&:hover $actionsDiv': {
            display: 'block'
        },
        '&:hover $lastModifiedTypography': {
            display: 'none'
        }
    },
    rowCursor: {
        '&&:hover': {
            cursor: 'pointer'
        }
    },
    selectedRow: {
        '&&&': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white
        }
    },
    cell: {
        maxWidth: '2vw',
        textOverflow: 'ellipsis'
    },
    selectedCell: {
        '&&': {
            color: 'white'
        }
    },
    publicationCell: {
        position: 'relative'
    },
    nameCell: {
        maxWidth: '15vw',
        '& img': {
            marginRight: '6px',
            verticalAlign: 'sub'
        }
    },
    lastModifiedCell: {
        paddingRight: '8px'
    },
    lastModifiedTypography: {
        textAlign: 'right',
        paddingRight: theme.spacing.unit * 2
    },
    actionsDiv: {
        float: 'right',
        color: theme.palette.primary.dark,
        display: 'none'
    },
    isDeleted: {
        textDecoration: 'line-through'
    },
    empty: {
        textAlign: 'center'
    },
    publicationStatusRoot: {
        top: 0,
        width: 6,
        '&:hover': {
            width: 640
        }
    },
    publicationStatusBorder: {
        '&:hover ~ $publicationInfoWrapper': {
            width: 640
        }
    },
    publicationInfoWrapper: {
        '&:hover': {
            width: 640
        }
    },
    disabledSort: {
        cursor: 'initial'
    }
});

export class ContentListTable extends React.Component {
    getCellClasses(node, classes, column, isSelected, isPreviewOpened) {
        let selected = isSelected && isPreviewOpened;
        let cellClasses = {
            root: classNames(
                classes.cell,
                classes[column + 'Cell'],
                {
                    [classes.selectedCell]: selected,
                    [classes[column + 'CellSelected']]: selected,
                    [classes.isDeleted]: isMarkedForDeletion(node)
                }
            )
        };
        return cellClasses;
    }

    isWip(node, lang) {
        switch (node.wipStatus) {
            case 'ALL_CONTENT':
                return true;
            case 'LANGUAGES':
                return _.includes(node.wipLangs, lang);
            default:
                return false;
        }
    }

    addIconSuffix(icon) {
        return (icon.includes('.png') ? icon : icon + '.png');
    }

    render() {
        const {
            rows, contentNotFound, pagination, sort, setCurrentPage, setPageSize,
            onPreviewSelect, previewSelection, totalCount, t, classes, uiLang, setSort, setPath, path, previewState,
            siteKey, mode, lang, switchSelection, addSelection, removeSelection, selection, loading
        } = this.props;
        let columnData = previewState === CM_DRAWER_STATES.SHOW ? reducedColumnData : allColumnData;
        let isPreviewOpened = previewState === CM_DRAWER_STATES.SHOW;

        return (
            <Paper>
                <ToolBar/>
                <div className={classes.tableWrapper}>
                    <Table aria-labelledby="tableTitle" data-cm-role="table-content-list">
                        <ContentListHeader
                            order={sort.order}
                            orderBy={sort.orderBy}
                            columnData={columnData}
                            classes={classes}
                            setSort={setSort}
                            anySelected={selection.length > 0 && rows.reduce((acc, node) => acc || selection.indexOf(node.path) !== -1, false)}
                            allSelected={selection.length > 0 && rows.reduce((acc, node) => acc && selection.indexOf(node.path) !== -1, true)}
                            selectAll={() => addSelection(rows.map(node => node.path))}
                            unselectAll={() => removeSelection(rows.map(node => node.path))}
                        />
                        <DxContext.Consumer>
                            {dxContext => (
                                <UploadTransformComponent uploadTargetComponent={TableBody} uploadPath={path}>
                                    {contentNotFound ?
                                        <ContentNotFound columnData={columnData} translate={t} class={classes.empty}/> :
                                        (_.isEmpty(rows) && !loading && mode === ContentManagerConstants.mode.BROWSE) ?
                                            <EmptyDropZone contentList path={path}/> :
                                            rows.map(node => {
                                                let isSelected = node.path === previewSelection && isPreviewOpened;
                                                let icon = this.addIconSuffix(node.icon);
                                                let showActions = !isPreviewOpened && selection.length === 0;
                                                let contextualMenu = React.createRef();
                                                return (
                                                    <TableRow
                                                        key={node.uuid}
                                                        hover
                                                        classes={{
                                                            root: classNames(classes.row, {[classes.rowCursor]: isPreviewOpened, [classes.rowShowActions]: showActions}),
                                                            selected: classes.selectedRow
                                                        }}
                                                        data-cm-node-path={node.path}
                                                        data-cm-role="table-content-list-row"
                                                        selected={isSelected}
                                                        onClick={() => {
                                                            if (!node.notSelectableForPreview) {
                                                                onPreviewSelect(node.path);
                                                            }
                                                        }}
                                                        onContextMenu={event => {
                                                            event.stopPropagation();
                                                            contextualMenu.current.open(event);
                                                        }}
                                                        onDoubleClick={allowDoubleClickNavigation(node.primaryNodeType, () => setPath(siteKey, node.path, mode))}
                                                    >
                                                        <ContextualMenu
                                                            ref={contextualMenu}
                                                            actionKey={selection.length === 0 || selection.indexOf(node.path) === -1 ? 'contentMenu' : 'selectedContentMenu'}
                                                            context={selection.length === 0 || selection.indexOf(node.path) === -1 ? {path: node.path} : {paths: selection}}
                                                        />
                                                        <TableCell
                                                            padding="none"
                                                            classes={{root: classes.publicationCell}}
                                                            data-cm-role="table-content-list-cell-publication"
                                                        >
                                                            <PublicationStatus node={node} classes={{root: classes.publicationStatusRoot, border: classes.publicationStatusBorder, publicationInfoWrapper: classes.publicationInfoWrapper}}/>
                                                        </TableCell>
                                                        <TableCell
                                                            padding="checkbox"
                                                            classes={this.getCellClasses(node, classes, 'checkbox', isSelected, isPreviewOpened)}
                                                        >
                                                            <Checkbox
                                                                checked={selection.indexOf(node.path) !== -1}
                                                                onClick={event => {
                                                                    switchSelection(node.path);
                                                                    event.stopPropagation();
                                                                }}
                                                            />
                                                        </TableCell>
                                                        {columnData.map(column => {
                                                            if (column.id === 'name') {
                                                                return (
                                                                    <TableCell
                                                                        key={column.id}
                                                                        classes={this.getCellClasses(node, classes, column.id, isSelected, isPreviewOpened)}
                                                                        data-cm-role="table-content-list-cell-name"
                                                                    >
                                                                        <Typography noWrap variant="body2" color="inherit">
                                                                            <img src={icon}/>
                                                                            {node[column.id]}
                                                                        </Typography>
                                                                    </TableCell>
                                                                );
                                                            }
                                                            if (column.id === 'wip') {
                                                                return (
                                                                    <TableCell
                                                                        key={column.id}
                                                                        classes={this.getCellClasses(node, classes, column.id, isSelected, isPreviewOpened)}
                                                                        padding="none"
                                                                    >
                                                                        {this.isWip(node, lang) &&
                                                                            <Tooltip title={t('label.contentManager.workInProgress', {wipLang: dxContext.langName})}>
                                                                                <Wrench fontSize="small" color="inherit"/>
                                                                            </Tooltip>
                                                                        }
                                                                    </TableCell>
                                                                );
                                                            }
                                                            if (column.id === 'lock') {
                                                                return (
                                                                    <TableCell
                                                                        key={column.id}
                                                                        classes={this.getCellClasses(node, classes, column.id, isSelected, isPreviewOpened)}
                                                                        padding="none"
                                                                    >
                                                                        {node.isLocked &&
                                                                            <Tooltip title={t('label.contentManager.locked')}>
                                                                                <Lock fontSize="small" color="inherit"/>
                                                                            </Tooltip>
                                                                        }
                                                                    </TableCell>
                                                                );
                                                            }
                                                            if (column.id === 'type') {
                                                                return (
                                                                    <TableCell
                                                                        key={column.id}
                                                                        classes={this.getCellClasses(node, classes, column.id, isSelected, isPreviewOpened)}
                                                                        data-cm-role="table-content-list-cell-type"
                                                                    >
                                                                        <Typography noWrap variant="body2" color="inherit">
                                                                            {node[column.id]}
                                                                        </Typography>
                                                                    </TableCell>
                                                                );
                                                            }
                                                            if (column.id === 'lastModified') {
                                                                return (
                                                                    <TableCell
                                                                        key={column.id}
                                                                        classes={this.getCellClasses(node, classes, column.id, isSelected, isPreviewOpened)}
                                                                        data-cm-role={'table-content-list-cell-' + column.id}
                                                                        padding={showActions ? 'checkbox' : 'default'}
                                                                    >
                                                                        <Typography noWrap variant="body2" color="inherit" className={classes.lastModifiedTypography}>
                                                                            <Moment format="ll" locale={uiLang}>
                                                                                {node[column.id]}
                                                                            </Moment>
                                                                        </Typography>

                                                                        {showActions &&
                                                                            <div key="actions" className={classes.actionsDiv} data-cm-role="table-content-list-cell-actions">
                                                                                <DisplayActions
                                                                                    target="contentActions"
                                                                                    filter={value => {
                                                                                        return _.includes(['edit', 'preview'], value.key);
                                                                                    }}
                                                                                    context={{path: node.path}}
                                                                                    render={iconButtonRenderer({
                                                                                        color: 'inherit',
                                                                                        disableRipple: true
                                                                                    }, true)}
                                                                                />
                                                                                <DisplayAction
                                                                                    actionKey="contentMenu"
                                                                                    context={{
                                                                                        path: node.path,
                                                                                        menuFilter: value => {
                                                                                            return !_.includes(['edit', 'preview'], value.key);
                                                                                        }
                                                                                    }}
                                                                                    render={iconButtonRenderer({
                                                                                        color: 'inherit',
                                                                                        disableRipple: true
                                                                                    }, true)}
                                                                                />
                                                                            </div>
                                                                        }
                                                                    </TableCell>
                                                                );
                                                            }
                                                            return (
                                                                <TableCell
                                                                    key={column.id}
                                                                    classes={this.getCellClasses(node, classes, column.id, isSelected, isPreviewOpened)}
                                                                    data-cm-role={'table-content-list-cell-' + column.id}
                                                                >
                                                                    <Typography noWrap variant="body2" color="inherit">
                                                                        {node[column.id]}
                                                                    </Typography>
                                                                </TableCell>
                                                            );
                                                        })}
                                                    </TableRow>
                                                );
                                            })
                                    }
                                </UploadTransformComponent>
                            )}
                        </DxContext.Consumer>
                    </Table>
                </div>
                <Pagination
                    totalCount={totalCount}
                    pageSize={pagination.pageSize}
                    currentPage={pagination.currentPage}
                    onChangeRowsPerPage={setPageSize}
                    onChangePage={setCurrentPage}
                />
            </Paper>
        );
    }

    componentDidUpdate() {
        const {rows, selection, removeSelection} = this.props;
        if (selection.length > 0) {
            const paths = rows.map(node => node.path);
            const toRemove = selection.filter(path => paths.indexOf(path) === -1);
            if (toRemove.length > 0) {
                removeSelection(toRemove);
            }
        }
    }
}

let ContentNotFound = props => {
    return (
        <TableRow>
            <TableCell colSpan={props.columnData.length + APP_TABLE_CELLS}>
                <Typography variant="subtitle1" className={props.class}>
                    {props.translate('label.contentManager.contentNotFound')}
                </Typography>
            </TableCell>
        </TableRow>
    );
};

const mapStateToProps = state => ({
    mode: state.mode,
    previewSelection: state.previewSelection,
    uiLang: state.uiLang,
    siteKey: state.site,
    path: state.path,
    lang: state.language,
    params: state.params,
    searchTerms: state.params.searchTerms,
    searchContentType: state.params.searchContentType,
    sql2SearchFrom: state.params.sql2SearchFrom,
    sql2SearchWhere: state.params.sql2SearchWhere,
    pagination: state.pagination,
    sort: state.sort,
    previewState: state.previewState,
    selection: state.selection
});

const mapDispatchToProps = dispatch => ({
    onPreviewSelect: previewSelection => dispatch(cmSetPreviewSelection(previewSelection)),
    setPath: (siteKey, path, mode) => {
        dispatch(cmOpenPaths(extractPaths(siteKey, path, mode)));
        dispatch(cmGoto({path}));
    },
    setCurrentPage: page => dispatch(cmSetPage(page)),
    setPageSize: pageSize => dispatch(cmSetPageSize(pageSize)),
    setSort: state => dispatch(cmSetSort(state)),
    clearSearch: params => {
        params = _.clone(params);
        _.unset(params, 'searchContentType');
        _.unset(params, 'searchTerms');
        _.unset(params, 'sql2SearchFrom');
        _.unset(params, 'sql2SearchWhere');
        dispatch(cmGoto({mode: 'browse', params: params}));
    },
    switchSelection: path => dispatch(cmSwitchSelection(path)),
    addSelection: path => dispatch(cmAddSelection(path)),
    removeSelection: path => dispatch(cmRemoveSelection(path))
});

ContentListTable.propTypes = {
    rows: PropTypes.array.isRequired,
    pagination: PropTypes.object.isRequired
};

export default compose(
    withStyles(styles),
    translate(),
    connect(mapStateToProps, mapDispatchToProps)
)(ContentListTable);
