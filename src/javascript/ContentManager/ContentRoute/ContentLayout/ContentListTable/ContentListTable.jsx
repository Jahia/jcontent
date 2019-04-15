import React from 'react';
import PropTypes from 'prop-types';
import {
    Badge,
    Checkbox,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Tooltip,
    withStyles
} from '@material-ui/core';
import {Typography} from '@jahia/ds-mui-theme';
import {Lock} from '@material-ui/icons';
import {Wrench} from 'mdi-material-ui';
import ContentListHeader from './ContentListHeader';
import {ContextualMenu, DisplayAction, DisplayActions, iconButtonRenderer, Pagination} from '@jahia/react-material';
import * as _ from 'lodash';
import {translate} from 'react-i18next';
import PublicationStatus from '../PublicationStatus';
import Moment from 'react-moment';
import {CM_DRAWER_STATES, cmGoto, cmOpenPaths} from '../../../ContentManager.redux-actions';
import {allowDoubleClickNavigation, extractPaths, isMarkedForDeletion} from '../../../ContentManager.utils';
import ToolBar from '../ToolBar';
import {connect} from 'react-redux';
import {compose} from 'react-apollo';
import UploadTransformComponent from '../UploadTransformComponent';
import classNames from 'classnames';
import {cmSetPreviewSelection} from '../../../preview.redux-actions';
import {cmSetSort} from '../sort.redux-actions';
import {cmSetPage, cmSetPageSize} from '../pagination.redux-actions';
import {cmAddSelection, cmRemoveSelection, cmSwitchSelection} from '../contentSelection.redux-actions';
import ContentManagerConstants from '../../../ContentManager.constants';
import ContentListEmptyDropZone from './ContentListEmptyDropZone';
import ContentNotFound from './ContentNotFound';
import EmptyTable from './EmptyTable';

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

const styles = theme => ({
    tableWrapper: {
        flex: '1 1 0%',
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
        },
        '& $badge': {
            color: theme.palette.brand.alpha,
            backgroundColor: theme.palette.invert.beta
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
        padding: '4px 8px 4px 24px',
        maxWidth: '16vw',
        '& img': {
            marginRight: '6px',
            verticalAlign: 'sub'
        },
        '& > span': {
            width: '100%',
            '& > p': {
                marginRight: theme.spacing.unit * 2
            }
        }
    },
    nameCellPreviewOpened: {
        maxWidth: '11vw'
    },
    lastModifiedCell: {
        paddingRight: '8px',
        width: '200px'
    },
    lastModifiedTypography: {
        textAlign: 'right',
        paddingRight: theme.spacing.unit * 2
    },
    actionsDiv: {
        float: 'right',
        color: theme.palette.primary.dark,
        display: 'none',
        '& button': {
            margin: 0
        }
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
            width: 640,
            minWidth: 640,
            maxWidth: 640
        }
    },
    publicationInfo: {
        minWidth: 640 - (theme.spacing.unit * 4) - 6
    },
    publicationInfoWrapper: {
        '&:hover': {
            width: 640,
            minWidth: 640,
            maxWidth: 640
        }
    },
    disabledSort: {
        cursor: 'initial'
    },
    subContentButton: {
        textDecoration: 'underline',
        margin: 0,
        padding: 0
    },
    badge: {
        marginTop: theme.spacing.unit,
        marginLeft: theme.spacing.unit,
        backgroundColor: theme.palette.brand.alpha,
        color: theme.palette.invert.beta
    }
});

export class ContentListTable extends React.Component {
    getCellClasses(node, classes, column, isSelected, isPreviewOpened) {
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
    }

    isWip(node, lang) {
        if (node.wipStatus) {
            switch (node.wipStatus.value) {
                case 'ALL_CONTENT':
                    return true;
                case 'LANGUAGES':
                    return _.includes(node.wipLangs.values, lang);
                default:
                    return false;
            }
        }
        return false;
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
            <>
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
                        {
                            contentNotFound ? (
                                <ContentNotFound columnData={columnData} t={t} className={classes.empty}/>
                                ) :
                                (
                                    (_.isEmpty(rows) && !loading) ? (
                                            (mode === ContentManagerConstants.mode.SEARCH || mode === ContentManagerConstants.mode.SQL2SEARCH) ?
                                                <EmptyTable columnData={columnData} t={t}/> :
                                                <ContentListEmptyDropZone mode={mode} path={path}/>
                                        ) :
                                        (
                                            <UploadTransformComponent uploadTargetComponent={TableBody}
                                                                      uploadPath={path}
                                                                      mode={mode}
                                            >
                                                {rows.map(node => {
                                                    let isSelected = node.path === previewSelection && isPreviewOpened;
                                                    let icon = this.addIconSuffix(node.primaryNodeType.icon);
                                                    let showActions = !isPreviewOpened && selection.length === 0;
                                                    let contextualMenu = React.createRef();
                                                    let showSubNodes = node.primaryNodeType.name !== 'jnt:page' && node.subNodes && node.subNodes.pageInfo.totalCount > 0;
                                                    return (
                                                        <TableRow
                                                            key={node.uuid}
                                                            hover
                                                            classes={{
                                                                root: classNames(classes.row, {
                                                                    [classes.rowCursor]: isPreviewOpened,
                                                                    [classes.rowShowActions]: showActions
                                                                }),
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
                                                            onDoubleClick={allowDoubleClickNavigation(
                                                                node.primaryNodeType.name,
                                                                node.subNodes ? node.subNodes.pageInfo.totalCount : null,
                                                                () => setPath(siteKey, node.path, mode, {sub: node.primaryNodeType.name !== 'jnt:page' && node.primaryNodeType.name !== 'jnt:contentFolder'})
                                                            )}
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
                                                                <PublicationStatus
                                                                    node={node}
                                                                    classes={{
                                                                        root: classes.publicationStatusRoot,
                                                                        border: classes.publicationStatusBorder,
                                                                        publicationInfo: classes.publicationInfo,
                                                                        publicationInfoWrapper: classes.publicationInfoWrapper
                                                                    }}
                                                                />
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
                                                                            {showSubNodes ?
                                                                                <Badge
                                                                                    badgeContent={node.subNodes.pageInfo.totalCount}
                                                                                    invisible={node.subNodes.pageInfo.totalCount === 0}
                                                                                    classes={{badge: classes.badge}}
                                                                                    data-cm-role="sub-contents-count"
                                                                                >
                                                                                    <Typography noWrap
                                                                                                variant="iota"
                                                                                                color="inherit"
                                                                                    >
                                                                                        <img src={icon}/>
                                                                                        {_.get(node, column.property)}
                                                                                    </Typography>
                                                                                </Badge> :
                                                                                <Typography noWrap
                                                                                            variant="iota"
                                                                                            color="inherit"
                                                                                >
                                                                                    <img src={icon}/>
                                                                                    {_.get(node, column.property)}
                                                                                </Typography>
                                                                            }
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
                                                                            <Tooltip
                                                                                title={node.wipLangs ? t('label.contentManager.workInProgress', {wipLang: node.wipLangs.values}) : t('label.contentManager.workInProgressAll')}
                                                                            >
                                                                                <Wrench fontSize="small"
                                                                                        color="inherit"/>
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
                                                                            {node.lockOwner !== null &&
                                                                            <Tooltip
                                                                                title={t('label.contentManager.locked')}
                                                                            >
                                                                                <Lock fontSize="small" color="inherit"/>
                                                                            </Tooltip>
                                                                            }
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
                                                                            <Typography noWrap
                                                                                        variant="iota"
                                                                                        color="inherit"
                                                                                        className={classes.lastModifiedTypography}
                                                                            >
                                                                                <Moment format="ll" locale={uiLang}>
                                                                                    {_.get(node, column.property)}
                                                                                </Moment>
                                                                            </Typography>
                                                                            {showActions &&
                                                                            <div key="actions"
                                                                                 className={classes.actionsDiv}
                                                                                 data-cm-role="table-content-list-cell-actions"
                                                                            >
                                                                                <DisplayActions
                                                                                    target="contentActions"
                                                                                    filter={value => {
                                                                                        return _.includes(['edit', 'preview', 'subContents', 'locate'], value.key);
                                                                                    }}
                                                                                    context={{path: node.path}}
                                                                                    render={iconButtonRenderer({
                                                                                        color: 'inherit',
                                                                                        size: 'compact',
                                                                                        disableRipple: true
                                                                                    }, true)}
                                                                                />
                                                                                <DisplayAction
                                                                                    actionKey="contentMenu"
                                                                                    context={{
                                                                                        path: node.path,
                                                                                        menuFilter: value => {
                                                                                            return !_.includes(['edit', 'preview', 'subContents', 'locate'], value.key);
                                                                                        }
                                                                                    }}
                                                                                    render={iconButtonRenderer({
                                                                                        color: 'inherit',
                                                                                        size: 'compact',
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
                                                                        <Typography noWrap
                                                                                    variant="iota"
                                                                                    color="inherit"
                                                                        >
                                                                            {_.get(node, column.property)}
                                                                        </Typography>
                                                                    </TableCell>
                                                                );
                                                            })}
                                                        </TableRow>
                                                    );
                                                })}
                                            </UploadTransformComponent>
                                        )
                                )
                        }
                    </Table>
                </div>
                <Pagination
                    totalCount={totalCount}
                    pageSize={pagination.pageSize}
                    currentPage={pagination.currentPage}
                    onChangeRowsPerPage={setPageSize}
                    onChangePage={setCurrentPage}
                />
            </>
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
    setPath: (siteKey, path, mode, params) => {
        dispatch(cmOpenPaths(extractPaths(siteKey, path, mode)));
        dispatch(cmGoto({path, params}));
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
    setSort: PropTypes.func.isRequired,
    siteKey: PropTypes.string.isRequired,
    sort: PropTypes.object.isRequired,
    switchSelection: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    totalCount: PropTypes.number.isRequired,
    uiLang: PropTypes.string.isRequired
};

export default compose(
    withStyles(styles),
    translate(),
    connect(mapStateToProps, mapDispatchToProps)
)(ContentListTable);
