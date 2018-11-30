import React from 'react';
import {Table, TableBody, TableCell, TableRow, Tooltip, Typography, withStyles} from '@material-ui/core';
import {VirtualsiteIcon} from '@jahia/icons';

import {Lock, CheckBoxOutlineBlank} from '@material-ui/icons';
import ContentListHeader from './ContentListHeader';
import {ContextualMenu, DisplayActions, iconButtonRenderer, Pagination} from '@jahia/react-material';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import {translate} from 'react-i18next';
import {DxContext} from '../DxContext';
import PublicationStatus from '../publicationStatus/PublicationStatusComponent';
import Moment from 'react-moment';
import {cmSetSelection, cmGoto, cmSetPage, cmSetPageSize, cmSetSort, CM_DRAWER_STATES} from '../redux/actions';
import {allowDoubleClickNavigation, isMarkedForDeletion} from '../utils';
import CmToolbar from '../CmToolbar';
import {connect} from 'react-redux';
import {compose} from 'react-apollo';
import UploadWrapperComponent from '../fileupload/UploadTransformComponent';

const allColumnData = [
    {id: 'name', label: 'label.contentManager.listColumns.name', sortable: true, property: 'displayName'},
    {id: 'wip', label: '', sortable: false, property: ''},
    {id: 'lock', label: '', sortable: false, property: ''},
    {id: 'type', label: 'label.contentManager.listColumns.type', sortable: true, property: 'primaryNodeType.displayName'},
    {id: 'lastModified', label: 'label.contentManager.listColumns.lastModified', sortable: true, property: 'lastModified.value'},
    {id: 'createdBy', label: 'label.contentManager.listColumns.createdBy', sortable: true, property: 'createdBy.value'}
];

const reducedColumnData = [
    {id: 'name', label: 'label.contentManager.listColumns.name', sortable: true, property: 'displayName'}
];

const APP_TABLE_CELLS = 2;

const styles = theme => ({
    type: {
        fontSize: '13px',
        minWidth: '100px',
        maxWidth: '100px',
        color: theme.palette.text.secondary
    },
    lastModified: {
        fontSize: '13px',
        color: theme.palette.text.secondary,
        minWidth: '140px',
        maxWidth: '140px'
    },
    createdBy: {
        fontSize: '13px',
        color: theme.palette.text.secondary,
        minWidth: '100px',
        maxWidth: '100px'
    },
    contentRow: {
        zIndex: 1800,
        '&:hover td > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON': {
            width: 20,
            zIndex: -1,
            marginLeft: '6px',
            height: (theme.spacing.unit * 6) + '!important',
            maxHeight: (theme.spacing.unit * 6) + '!important'
        },
        '&:hover td > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON .CM_PUBLICATION_INFO_ICON': {
            display: 'block'
        }
    },
    publicationStatusContainer: {
        position: 'relative'
    },
    publicationStatus: {
        position: 'absolute',
        left: -23,
        top: 0,
        width: 30,
        minWidth: 30,
        height: '30px !important',
        maxHeight: '30px !important',
        overflow: 'hidden',
        justifyContent: 'flex-start',
        textTransform: 'none',
        opacity: 0,
        transition: ['opacity', '0.25s'],
        '&:hover': {
            height: 350,
            opacity: 1,
            transition: ['opacity', '0.25s'],
            width: 'auto'
        },
        color: theme.palette.getContrastText(theme.palette.publish.main)
    },
    publicationStatusModified: {
        backgroundColor: theme.palette.publicationStatus.modified.main,
        '&:hover': {
            backgroundColor: theme.palette.publicationStatus.modified.main
        }
    },
    publicationStatusMarkedForDeletion: {
        backgroundColor: theme.palette.publicationStatus.modified.main,
        '&:hover': {
            backgroundColor: theme.palette.publicationStatus.modified.main
        }
    },
    publicationStatusPublished: {
        backgroundColor: theme.palette.publicationStatus.published.main,
        '&:hover': {
            backgroundColor: theme.palette.publicationStatus.published.main
        }
    },
    publicationStatusNotPublished: {
        backgroundColor: theme.palette.publicationStatus.notPublished.main,
        '&:hover': {
            backgroundColor: theme.palette.publicationStatus.notPublished.main
        }
    },
    publicationStatusInfoIcon: {
        color: theme.palette.getContrastText(theme.palette.publish.main),
        marginRight: theme.spacing.unit / 2
    },
    publicationStatusLabel: {
        whiteSpace: 'nowrap'
    },
    activeStatus: {
        backgroundColor: '#E67D3A',
        color: theme.palette.common.white,
        opacity: '0.9',
        '&:hover': {
            opacity: '1.5'
        },
        padding: '1px'
    },
    activeStatusSelected: {
        color: '#FFA83F',
        opacity: '0.9',
        '&:hover': {
            opacity: '1.5'
        },
        padding: '1px'
    },
    name: {
        color: theme.palette.text.secondary,
        marginLeft: '-10px',
        fontSize: '14px'
    },
    nodeTypeIcon: {
        marginRight: '6px',
        verticalAlign: 'sub'
    },
    publicationCell: {
        position: 'relative',
        display: 'flex',
        padding: 0,
        height: theme.spacing.unit * 6,
        minHeight: theme.spacing.unit * 6
    },
    actionCell: {
        minWidth: '22px'
    },
    hoveredRowAction: {
        '& svg': {
            width: '18px',
            marginLeft: '10px',
            height: '18px'
        }
    },
    hoveredRowAction2: {
        color: theme.palette.text.disabled,
        '& svg': {
            width: '18px',
            height: '18px'
        }
    },
    selectedRowAction: {
        color: theme.palette.primary.contrastText + ' !important'
    },
    unselectedRowAction: {
        color: theme.palette.primary.main + ' !important'
    },
    hoveredRowActionsCell: {
        color: theme.palette.text.disabled,
        textAlign: 'center'
    },
    contentList: {
        background: theme.palette.background.default,
        overflowY: 'scroll',
        overflowX: 'scroll',
        height: 'calc(100vh - 100px)',
        maxHeight: 'calc(100vh - 100px)'
    },
    row: {
        backgroundColor: theme.palette.background.paper,
        '&:hover': {
            backgroundColor: theme.palette.background.default + '!important'
        }

    },
    rowPair: {
        backgroundColor: theme.palette.background.paper,
        '&:hover': {
            backgroundColor: theme.palette.background.default + '!important'
        }
    },
    selectedRow: {
        backgroundColor: theme.palette.primary.main + '!important'
    },
    selectedRowMarkedForDeletion: {
        backgroundColor: theme.palette.error.dark + '!important'
    },
    selectedCell: {
        color: theme.palette.primary.contrastText + ' !important'
    },
    cell: {
        color: theme.palette.text.secondary + '!important'
    },
    textOverflow1: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        width: '100px',
        display: 'block',
        overflow: 'hidden'
    },
    tableCellHeight: {
        position: 'sticky',
        zIndex: 1800,
        top: 56
    },
    gridDirection: {
        textAlign: 'right!important'
    },
    tableCellWidthHead: {
        minWidth: '200px',
        position: 'sticky',
        zIndex: 1800,
        top: 56
    },
    tableCellWidth: {
        position: 'sticky',
        zIndex: 1800,
        top: 56
    },
    sortLabel: {
        color: theme.palette.text.secondary
    },
    noResults: {
        color: theme.palette.text.disabled,
        fontWeight: 600
    },
    paddingCell: {
        padding: 0
    },
    cellColor: {
        padding: 0,
        backgroundColor: 'transparent'
    },
    nameCellWidth: {
        maxWidth: 250,
        '@media (min-width: 576px)': {
            maxWidth: 250
        },
        '@media (min-width:780px)': {
            maxWidth: 250
        },
        '@media (min-width:992px)': {
            maxWidth: 250
        },
        '@media (min-width: 1200px)': {
            maxWidth: 250
        }
    },
    tableButton: {
        padding: 0,
        margin: '0 !important'
    },
    colorToolbar: {
        background: theme.palette.background.paper,
        zIndex: '1800',
        position: 'sticky',
        top: 0
    },
    tableOverride: {
        borderCollapse: 'unset'
    },
    tableSticky: {
        overflow: 'scroll!important',
        borderCollapse: 'inherit'
    },
    paddingCheckbox: {
        paddingLeft: theme.spacing.unit * 3,
        paddingRight: theme.spacing.unit * 3
    },
    paddingAction: {
        paddingRight: (theme.spacing.unit * 2) + '!important'
    },
    alignAction: {
        textAlign: 'center'
    },
    guttersToolbar: {
        paddingLeft: (theme.spacing.unit * 3) + '!important',
        paddingRight: (theme.spacing.unit * 3) + '!important'
    },
    colorCheckbox: {
        color: theme.palette.text.secondary
    }
});

class ContentListTable extends React.Component {
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
        return (!icon.includes('.png') ? icon + '.png' : icon);
    }

    renderLock(row, isSelected) {
        let {classes, t} = this.props;
        return row.isLocked ?
            <Tooltip title={t('label.contentManager.locked')}>
                <Lock style={{width: '22px', height: '22px'}}
                    className={isSelected ? classes.activeStatusSelected : classes.activeStatus}/>
            </Tooltip> : null;
    }

    renderWip(row, dxContext, isSelected) {
        let {classes, t, lang} = this.props;
        if (this.isWip(row, lang)) {
            return (
                <Tooltip
                    title={t('label.contentManager.workInProgress', {wipLang: dxContext.langName})}
                    ><VirtualsiteIcon style={{width: '28px', height: '28px'}}
                        className={isSelected ? classes.activeStatusSelected : classes.activeStatus}/>
                </Tooltip>
            );
        }
        return null;
    }

    render() {
        const {rows, contentNotFound, pagination, sort, setCurrentPage, setPageSize,
            onRowSelected, selection, totalCount, t, classes, uiLang, setSort, setPath, path, previewState} = this.props;
        let columnData = previewState === CM_DRAWER_STATES.SHOW ? reducedColumnData : allColumnData;
        return (
            <div className={classes.contentList}>
                <CmToolbar/>
                <Table aria-labelledby="tableTitle" data-cm-role="table-content-list" classes={{root: classes.tableSticky}}>
                    <ContentListHeader
                        order={sort.order}
                        orderBy={sort.orderBy}
                        columnData={columnData}
                        classes={classes}
                        setSort={setSort}
                    />
                    <DxContext.Consumer>
                        {dxContext => (
                            <UploadWrapperComponent uploadTargetComponent={TableBody} uploadPath={path}>
                                {contentNotFound ? <ContentNotFound columnData={columnData} classes={classes} translate={t}/> : _.isEmpty(rows) ? <EmptyRow columnData={columnData} classes={classes} translate={t}/> : rows.map((n, key) => {
                                    let isSelected = _.find(selection, item => item.path === n.path) !== undefined;
                                    let renderWip = this.renderWip(n, dxContext, isSelected);
                                    let renderLock = this.renderLock(n, isSelected);
                                    let icon = this.addIconSuffix(n.icon);
                                    let cellContentClasses = {root: isSelected ? classes.selectedCell : classes.cell};
                                    let nameCellContentClasses = cellContentClasses;
                                    let isDeleted = isMarkedForDeletion(n);
                                    if (isDeleted) {
                                        nameCellContentClasses = {root: (isSelected ? classes.selectedCell : classes.cellDeleted) + ' ' + classes.isDeleted};
                                    }
                                    let contextualMenu = React.createRef();
                                    return (
                                        <TableRow
                                            key={n.uuid}
                                            hover
                                            classes={{root: classes.contentRow, selected: classes.selectedRow}}
                                            className={isSelected ? '' : ((key % 2 === 0) ? classes.row : classes.rowPair)}
                                            data-cm-node-path={n.path}
                                            data-cm-role="table-content-list-row"
                                            selected={isSelected}
                                            onClick={() => onRowSelected([n])}
                                            onContextMenu={event => {
                                                event.stopPropagation();
                                                contextualMenu.current.open(event);
                                            }}
                                            onDoubleClick={allowDoubleClickNavigation(n.primaryNodeType, () => setPath(n.path))}
                                            >
                                            <ContextualMenu ref={contextualMenu} actionKey="contextualMenuContent" context={{path: n.path}}/>

                                            <TableCell className={classes.publicationCell} data-cm-role="table-content-list-cell-publication" classes={{root: classes.cellColor}}>
                                                <PublicationStatus node={n} publicationInfoWidth={400}/>
                                            </TableCell>
                                            <TableCell padding="none" className={classes.paddingCheckbox} classes={{root: classes.cellColor}}>
                                                <CheckBoxOutlineBlank classes={nameCellContentClasses}/>
                                            </TableCell>
                                            {columnData.map(column => {
                                                if (column.id === 'name') {
                                                    return (
                                                        <TableCell key={column.id} data-cm-role="table-content-list-cell-name" className={classes.nameCellWidth} classes={{root: classes.cellColor}}>
                                                            <Typography noWrap
                                                                className={isDeleted ? classes[column.id] + ' ' + classes.isDeleted : classes[column.id]}
                                                                classes={nameCellContentClasses}
                                                                >
                                                                <img src={icon} className={classes.nodeTypeIcon}/>
                                                                {n[column.id]}
                                                            </Typography>
                                                        </TableCell>
                                                    );
                                                }
                                                if (column.id === 'wip') {
                                                    return (
                                                        <TableCell key={column.id} className={classes.actionCell} padding="none" classes={{root: classes.cellColor}}>{renderWip}
                                                        </TableCell>
                                                    );
                                                }
                                                if (column.id === 'lock') {
                                                    return (
                                                        <TableCell key={column.id} className={classes.actionCell} padding="none" classes={{root: classes.cellColor}}>{renderLock}
                                                        </TableCell>
                                                    );
                                                }
                                                if (column.id === 'type') {
                                                    return (
                                                        <TableCell key={column.id} data-cm-role="table-content-list-cell-name" classes={{root: classes.cellColor}}>
                                                            <Typography noWrap
                                                                className={isDeleted ? classes[column.id] + ' ' + classes.isDeleted : classes[column.id]}
                                                                classes={nameCellContentClasses}
                                                                >
                                                                <img src={icon} className={classes.nodeTypeIcon}/>
                                                                {n[column.id]}
                                                            </Typography>
                                                        </TableCell>
                                                    );
                                                }
                                                if (column.id === 'lastModified') {
                                                    return (
                                                        <TableCell
                                                            key={column.id}
                                                            padding="none"
                                                            classes={{root: classes.cellColor}}
                                                            data-cm-role={'table-content-list-cell-' + column.id}
                                                            >
                                                            <Typography className={classes[column.id]} classes={cellContentClasses}>
                                                                <Moment format="ll" locale={uiLang}>{n[column.id]}</Moment>
                                                            </Typography>
                                                        </TableCell>
                                                    );
                                                }
                                                return (
                                                    <TableCell
                                                        key={column.id}
                                                        padding="none"
                                                        classes={{root: classes.cellColor}}
                                                        data-cm-role={'table-content-list-cell-' + column.id}
                                                        >
                                                        <Typography className={classes[column.id] + ' ' + classes.textOverflow1} classes={cellContentClasses}>
                                                            {n[column.id]}
                                                        </Typography>
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell classes={{root: classes.cellColor}}/>
                                            <TableCell
                                                padding="none"
                                                className={classes.hoveredRowActionsCell + ' ' + classes.paddingAction}
                                                data-cm-role="table-content-list-cell-"
                                                classes={{root: classes.cellColor}}
                                                ><DisplayActions target="tableActions" context={{path: n.path}} render={iconButtonRenderer({disableRipple: true, className: classes.tableButton + ' ' + classes.hoveredRowAction, classes: nameCellContentClasses}, true)}/>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </UploadWrapperComponent>
                        )}
                    </DxContext.Consumer>
                </Table>
                {totalCount > 0 &&
                <Pagination
                    totalCount={totalCount}
                    pageSize={pagination.pageSize}
                    currentPage={pagination.currentPage}
                    onChangeRowsPerPage={setPageSize}
                    onChangePage={setCurrentPage}
                />
                }
            </div>
        );
    }
}

let EmptyRow = props => {
    return (
        <TableRow>
            <TableCell colSpan={props.columnData.length + APP_TABLE_CELLS + 2} className={props.classes.noResults}>
                {props.translate('label.contentManager.noResults')}
            </TableCell>
        </TableRow>
    );
};

let ContentNotFound = props => {
    return (
        <TableRow>
            <TableCell colSpan={props.columnData.length + APP_TABLE_CELLS} className={props.classes.noResults}>
                {props.translate('label.contentManager.contentNotFound')}
            </TableCell>
        </TableRow>
    );
};

const mapStateToProps = state => ({
    mode: state.mode,
    selection: state.selection,
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
    previewState: state.previewState
});

const mapDispatchToProps = dispatch => ({
    onRowSelected: selection => dispatch(cmSetSelection(selection)),
    setPath: (path, params) => dispatch(cmGoto({path, params})),
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
    }
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
