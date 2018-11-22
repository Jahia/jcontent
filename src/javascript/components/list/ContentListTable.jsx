import React from 'react';
import {Table, TableBody, TableCell, TableRow, Toolbar, Grid, Tooltip, Typography, withStyles, Button, Icon} from '@material-ui/core';
import {VirtualsiteIcon} from '@jahia/icons';
import {Lock, Close, CheckBox} from '@material-ui/icons';
import ContentListHeader from './ContentListHeader';
import {ContextualMenu, DisplayActions, iconButtonRenderer, Pagination} from '@jahia/react-material';
import PropTypes from 'prop-types';
import FilesGridModeSelector from '../filesGrid/FilesGridModeSelector';
import ContentBreadcrumbs from '../breadcrumb/ContentBreadcrumbs';
import * as _ from 'lodash';
import {translate} from 'react-i18next';
import {DxContext} from '../DxContext';
import PublicationStatus from '../publicationStatus/PublicationStatusComponent';
import Moment from 'react-moment';
import {cmSetSelection, cmGoto} from '../redux/actions';
import {allowDoubleClickNavigation, isMarkedForDeletion} from '../utils';
import {connect} from 'react-redux';
import {compose} from 'react-apollo';
import UploadWrapperComponent from '../fileupload/UploadTransformComponent';
import Constants from '../constants';
import {buttonRenderer} from '@jahia/react-material/index';
import {refetchContentTreeAndListData, setContentListDataRefetcher, setRefetcher} from '../refetches';

const columnData = [
    {id: 'name', label: 'label.contentManager.listColumns.name', sortable: true, property: 'displayName'},
    {id: 'wip', label: '', sortable: false, property: ''},
    {id: 'lock', label: '', sortable: false, property: ''},
    {id: 'type', label: 'label.contentManager.listColumns.type', sortable: true, property: 'primaryNodeType.displayName'},
    {id: 'lastModified', label: 'label.contentManager.listColumns.lastModified', sortable: true, property: 'lastModified.value'},
    {id: 'createdBy', label: 'label.contentManager.listColumns.createdBy', sortable: true, property: 'createdBy.value'}
];

const APP_TABLE_CELLS = 2;

const styles = theme => ({
    type: {
        fontSize: '13px',
        minWidth: '100px',
        maxWidth: '100px',
        color: theme.palette.text.secondary,
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
        '&:hover td > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON': {
            width: 20,
            zIndex: -1,
            marginLeft: '6px',
            height: '37px !important',
            maxHeight: '37px !important'
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
        height: '37px !important',
        minHeight: 37 // Same as row height
    },
    actionCell: {
        minWidth: '22px'
    },
    hoveredRowAction: {
        color: theme.palette.primary.main,
        '& svg': {
            width: '18px',
            marginLeft: '10px',
            height: '18px'
        }
    },
    hoveredRowAction2: {
        color: '#5E6565',
        '& svg': {
            width: '18px',
            height: '18px'
        }
    },
    selectedRowAction: {
        color: theme.palette.primary.contrastText + ' !important'
    },
    hoveredRowActionsCell: {
        color: theme.palette.text.disabled,
        minWidth: '100px',
    },
    contentList: {
        background: theme.palette.background.default,
        overflowY: 'scroll',
        overflowX: 'scroll',
        height: 'calc(100vh - 140px)',
        maxHeight: 'calc(100vh - 140px)'
    },
    row : {
        backgroundColor: theme.palette.background.paper,
        '&:hover': {
            backgroundColor: theme.palette.background.default + '!important',
        }

    },
    rowPair: {
        backgroundColor: theme.palette.background.paper,
        '&:hover': {
	        backgroundColor: theme.palette.background.default + '!important',
        }
    },
    selectedRow: {
        backgroundColor: theme.palette.primary.main + '!important'
    },
    selectedRowMarkedForDeletion: {
        backgroundColor: theme.palette.error.dark +'!important',
    },
    selectedCell: {
        color: theme.palette.primary.contrastText + ' !important'
    },
    cell: {
        color: '#5E6565 !important'
    },
    textOverflow1 :{
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        width: '100px',
        display: 'block',
        overflow: 'hidden'
    },
    tableCellHeight: {
        position: 'sticky',
        top: 0,
    },
    sortLabel:{
	    color: theme.palette.text.secondary,
    },
    noResults: {
	    color: theme.palette.text.disabled,
        fontWeight: 600
    },
    paddingCell: {
        paddingLeft: 5,
        paddingRight: 5
    },
    nameCellWidth: {
        maxWidth: 50,
        '@media (min-width: 576px)': {
            maxWidth: 50
        },
        '@media (min-width:780px)': {
            maxWidth: 50
        },
        '@media (min-width:992px)': {
            maxWidth: 50
        },
        '@media (min-width: 1200px)': {
            maxWidth: 50
        }
    },

    tableButton: {
        padding: 0,
        margin: '0 !important'
    },
    colorToolbar: {
        background: theme.palette.background.paper,
    },
    tableOverride: {
        borderCollapse: 'unset',
    }
});


const GRID_SIZE = 12;
const GRID_PANEL_BUTTONS_SIZE = 5;
class ContentListTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
	        showList: false,
            hoveredRow: null
        };
        this.contextualMenuClosed = this.contextualMenuClosed.bind(this);
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
        return (!icon.includes('.png') ? icon + '.png' : icon);
    }

    onHoverEnter($event) {
        this.setState({
            hoveredRow: $event.currentTarget !== null ? $event.currentTarget.getAttribute('data-cm-node-path') : null
        });
    }

    onHoverExit() {
        this.setState({
            hoveredRow: null
        });
    }

    contextualMenuClosed() {
        setTimeout(() => {
            let hoveredEl = document.querySelector('tr[data-cm-role="table-content-list-row"]:hover');
            if (hoveredEl !== null) {
                this.setState({
                    hoveredRow: hoveredEl.getAttribute('data-cm-node-path')
                });
            }
        }, 100);
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

    setContentRefetcher(refetchingData) {
        setContentListDataRefetcher(refetchingData);
    };

    setTreeRefetcher(type) {
        return (refetchingData) => setRefetcher(type, refetchingData);
    };

    refreshContentsAndTree(contentTreeConfigs) {
        refetchContentTreeAndListData(contentTreeConfigs);
    }

    isBrowsing() {
        let {mode} = this.props;
        return (mode === Constants.mode.BROWSE || mode === Constants.mode.FILES);
    };

    isSearching() {
        let {mode} = this.props;
        return (mode === Constants.mode.SEARCH || mode === Constants.mode.SQL2SEARCH);
    };

    isRootNode() {
        let {path, siteKey} = this.props;
        return (path === ('/sites/' + siteKey));
    }
    ;
    render() {
        const {hoveredRow} = this.state;
        const {contentTreeConfigs, rows, contentNotFound, page, pageSize, onChangeRowsPerPage,
            onChangePage, onRowSelected, selection, totalCount, t, classes,
	        searchContentType, sql2SearchFrom, sql2SearchWhere,searchTerms,
            uiLang, handleSort, order, orderBy, setPath, mode, path, clearSearch} = this.props;

	    const params = {
		    searchContentType: searchContentType,
		    searchTerms: searchTerms,
		    sql2SearchFrom: sql2SearchFrom,
		    sql2SearchWhere: sql2SearchWhere
	    };

        const emptyRows = pageSize - Math.min(pageSize, totalCount - (page * pageSize));

        return (
            <div className={classes.contentList}>
                <Toolbar className={classes.colorToolbar}>
                    <Grid container item xs={GRID_SIZE} direction="row" alignItems="center" className={this.isSearching() ? classes.blockCoreSearch : classes.blockCore}>
                        <Grid item xs={GRID_SIZE - GRID_PANEL_BUTTONS_SIZE}>
                            <div className={classes.breadCrumbs}>
                                <ContentBreadcrumbs mode={this.props.mode}/>
                            </div>
                        </Grid>
                        <Grid item xs={GRID_PANEL_BUTTONS_SIZE} className={classes.showTree}>
                            {mode === Constants.mode.FILES &&
                            <FilesGridModeSelector showList={this.state.showList} onChange={() => this.setState(state => ({showList: !state.showList}))}/>
		                    }
                            {this.isBrowsing() && !this.isRootNode() &&
                            <React.Fragment>
                                <DisplayActions target="tableHeaderActions" context={{path: path}} render={buttonRenderer({},true)}/>
                            </React.Fragment>
		                    }
                            {this.isBrowsing() &&
                            <Button variant="text" className={classes.showTreeButton} onClick={this.handleDrawerOpen}>
                                <Icon name="folder" fill="#d4d9dd"/>
                                {t('label.contentManager.tree.' + (open ? 'hide' : 'show'))}
                            </Button>
		                    }
                            <Button variant="text" className={classes.refreshButton} onClick={() => this.refreshContentsAndTree(contentTreeConfigs)}>
                                <Icon name="refresh" fill="#d4d9dd" size={20}/>
                                {t(this.isSearching() ? 'label.contentManager.search.refresh' : 'label.contentManager.refresh')}
                            </Button>
                            {this.isSearching() &&
                            <Button data-cm-role="search-clear" variant="text"
		                            className={classes.searchClearButton}
		                            classes={{sizeSmall: classes.searchClear}} onClick={() => clearSearch(params)}>
                                <Close className={classes.searchClearIcon}/>
                                {t('label.contentManager.search.clear')}
                            </Button>
		                    }
                        </Grid>
                    </Grid>

                </Toolbar>
                <Table aria-labelledby="tableTitle" data-cm-role="table-content-list">
                    <ContentListHeader
                        order={order}
                        orderBy={orderBy}
                        columnData={columnData}
                        classes={classes}
                        onRequestSort={handleSort}
                    />
                    <DxContext.Consumer>
                        {dxContext => (
                            <UploadWrapperComponent uploadTargetComponent={TableBody} uploadPath={path}>
                                {contentNotFound ? <ContentNotFound classes={classes} translate={t}/> : _.isEmpty(rows) ? <EmptyRow classes={classes} translate={t}/> : rows.map((n, key) => {
                                    let isSelected = _.find(selection, item => item.path === n.path) !== undefined;
                                    let isHoveredRow = hoveredRow === n.path;
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
                                            onMouseEnter={event => this.onHoverEnter(event)}
                                            onMouseLeave={event => this.onHoverExit(event)}
                                            >
                                            <ContextualMenu ref={contextualMenu} actionKey="contextualMenuContent" context={{path: n.path}}/>

                                            <TableCell className={classes.publicationCell} data-cm-role="table-content-list-cell-publication">
                                                <PublicationStatus node={n} publicationInfoWidth={400}/>
                                            </TableCell>
                                            <TableCell paddingNone>
                                                <CheckBox color="secondary" />
                                            </TableCell>
                                            {columnData.map(column => {
			                                    if (column.id === 'wip') {
				                                    return (
				                                        <TableCell key={column.id} className={classes.actionCell} padding="none">
                                                            {renderWip}
                                                        </TableCell>
                                                    );
			                                    }
			                                    if (column.id === 'lock') {
				                                    return (
				                                        <TableCell key={column.id} className={classes.actionCell} padding="none">
                                                            {renderLock}
				                                        </TableCell>
                                                    );
			                                    }
			                                    if (column.id === 'name') {
				                                    return (
				                                        <TableCell key={column.id} data-cm-role="table-content-list-cell-name" className={classes.nameCellWidth}>
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
	                                            if (column.id === 'type') {
		                                            return (
		                                                <TableCell key={column.id} data-cm-role="table-content-list-cell-name">
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
					                                        classes={{root: classes.paddingCell}}
					                                        data-cm-role={'table-content-list-cell-' + column.id}
				                                            >
                                                            <Typography className={classes[column.id]} classes={cellContentClasses}>
                                                                <Moment format="ll" locale={uiLang}>{n[column.id]}</Moment>
                                                            </Typography>
				                                        </TableCell>
                                                    );
			                                    }
			                                    if (column.id === 'createdBy' && isHoveredRow) {
				                                    return (
				                                        <TableCell
					                                        key={column.id}
					                                        classes={{root: classes.paddingCell }}
					                                        className={classes.hoveredRowActionsCell}
                                                            data-cm-role={'table-content-list-cell-' + column.id}
					                                        padding="none"
				                                            >
                                                            <DisplayActions target="tableActions"
                                                                context={{path: n.path}}
                                                                render={iconButtonRenderer({disableRipple:true, className:classes.tableButton + ' ' + classes.hoveredRowAction + ' ' + (isSelected ? classes.selectedRowAction : '')},true)}/>
				                                        </TableCell>
                                                    );
			                                    }
			                                    return (
                                                    <TableCell
				                                        key={column.id}
				                                        padding="none"
				                                        classes={{root: classes.paddingCell}}
				                                        data-cm-role={'table-content-list-cell-' + column.id}
			                                            >
                                                        <Typography className={classes[column.id] + ' ' + classes.textOverflow1} classes={cellContentClasses}>
                                                            {n[column.id]}
                                                        </Typography>
			                                        </TableCell>
                                                );

		                                    })}
                                            <TableCell
		                                        className={classes.hoveredRowActionsCell}
		                                        classes={{root: classes.paddingCell }}
		                                        padding='none'
		                                        data-cm-role='table-content-list-cell-'
	                                            >
                                                <DisplayActions target="tableActions" context={{path: n.path}} render={iconButtonRenderer({disableRipple:true, className:classes.tableButton + ' ' + classes.hoveredRowAction + ' ' + (isSelected ? classes.selectedRowAction : '')},true)}/>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {emptyRows > 0 &&
                                <TableRow>
                                    <TableCell colSpan={columnData.length + APP_TABLE_CELLS + 1} padding="none"/>
                                </TableRow>
                                }
                            </UploadWrapperComponent>
                        )}
                    </DxContext.Consumer>
                </Table>
                {totalCount > 0 &&
                <Pagination
				    totalCount={totalCount}
				    pageSize={pageSize}
				    currentPage={page}
				    onChangeRowsPerPage={onChangeRowsPerPage}
				    onChangePage={onChangePage}
                />
                }
            </div>
        );
    }
}

let EmptyRow = props => {
    return (
        <TableRow>
            <TableCell colSpan={columnData.length + APP_TABLE_CELLS} className={props.classes.noResults}>
                {props.translate('label.contentManager.noResults')}
            </TableCell>
        </TableRow>
    );
};

let ContentNotFound = props => {
    return (
        <TableRow>
            <TableCell colSpan={columnData.length + APP_TABLE_CELLS} className={props.classes.noResults}>
                {props.translate('label.contentManager.contentNotFound')}
            </TableCell>
        </TableRow>
    );
};

const mapStateToProps = state => ({
    selection: state.selection,
    uiLang : state.uiLang,
    lang : state.language,
    params: state.params,
    searchTerms: state.params.searchTerms,
    searchContentType: state.params.searchContentType,
    sql2SearchFrom: state.params.sql2SearchFrom,
    sql2SearchWhere: state.params.sql2SearchWhere
});

const mapDispatchToProps = dispatch => ({
    onRowSelected: selection => dispatch(cmSetSelection(selection)),
    setPath: (path, params) => dispatch(cmGoto({path, params})),
    clearSearch: (params) => {
        params = _.clone(params);
        _.unset(params, 'searchContentType');
        _.unset(params, 'searchTerms');
        _.unset(params, 'sql2SearchFrom');
        _.unset(params, 'sql2SearchWhere');
        dispatch(cmGoto({mode: 'browse', params: params}))
    }
});

ContentListTable.propTypes = {
    rows: PropTypes.array.isRequired,
    page: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    onChangeRowsPerPage: PropTypes.func.isRequired,
    onChangePage: PropTypes.func.isRequired
};

export default compose(
    withStyles(styles),
    translate(),
    connect(mapStateToProps, mapDispatchToProps)
)(ContentListTable);