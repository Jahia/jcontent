import React from "react";
import {
    Table,
    TableBody,
    TableRow,
    TableCell,
    withStyles,
    Typography,
    Tooltip,
    IconButton
} from "@material-ui/core";
import {VirtualsiteIcon} from '@jahia/icons';
import {Visibility, Create, Autorenew} from "@material-ui/icons";
import ContentListHeader from "./ContentListHeader";
import {Pagination, DisplayActions, DisplayAction, iconButtonRenderer} from "@jahia/react-material";
import PropTypes from 'prop-types';
import * as _ from "lodash";
import {translate} from "react-i18next";
import {Lock, Build} from "@material-ui/icons";
import {DxContext} from "../DxContext";
import PublicationStatus from '../publicationStatus/PublicationStatusComponent';
import Moment from 'react-moment';
import {cmSetSelection} from "../redux/actions";
import {connect} from "react-redux";

const columnData = [
    {id: 'name', label: 'label.contentManager.listColumns.name', sortable: true, property: 'displayName'},
    {id: 'wip', label: '', sortable: false, property: ''},
    {id: 'lock', label: '', sortable: false, property: ''},
    {id: 'type', label: 'label.contentManager.listColumns.type', sortable: true, property: 'primaryNodeType.displayName'},
    {id: 'lastModified', label: 'label.contentManager.listColumns.lastModified', sortable: true, property: 'lastModified.value'},
    {id: 'createdBy', label: 'label.contentManager.listColumns.createdBy', sortable: true, property: 'createdBy.value'}
];

const APP_TABLE_CELLS = 2;

const styles = (theme) => ({
    type: {
        fontSize: '13px',
        minWidth: "100px",
        maxWidth: "100px",
        color: "#313131"
    },
    lastModified: {
        fontSize: '13px',
        color: "#313131",
        minWidth: "140px",
        maxWidth: "140px"
    },
    createdBy: {
        fontSize: '13px',
        color: "#313131",
        minWidth: "100px",
        maxWidth: "100px"
    },
    contentRow: {
        height: '28px !important',
        maxHeight: '28px !important',
        "&:hover td > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON": {
            width: 20,
            zIndex: -1,
            marginLeft: '6px',
            height: '37px !important',
            maxHeight: '37px !important',
        },
        "&:hover td > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON .CM_PUBLICATION_INFO_ICON": {
            display: "block",
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
        transition: ["opacity", "0.25s"],
        '&:hover': {
            height: 350,
            opacity: 1,
            transition: ["opacity", "0.25s"],
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
        whiteSpace: 'nowrap',
    },
    activeStatus: {
        backgroundColor: '#E67D3A',
        color: '#fff',
        opacity: '0.9',
        '&:hover': {
            opacity: '1.5'
        },
        padding: "1px",
        width: "20px",
        height: "20px"
    },
    name: {
        color: "#313131",
        marginLeft: '-10px',
        fontSize: '14px',
    },
    nodeTypeIcon: {
        marginRight: '6px',
        verticalAlign: 'sub',
    },
    publicationCell: {
        position: 'relative',
        display: "flex",
        padding: 0,
        height: "37px !important",
        minHeight: 37 //same as row height
    },
    actionCell: {
        minWidth: "38px"
    },
    hoveredRowAction: {
        color: "#5E6565",
        '& svg': {
            width: "18px",
            marginLeft: '10px',
            height: "18px"
        }
    },
    hoveredRowAction2: {
        color: "#5E6565",
        '& svg': {
            width: "18px",
            height: "18px"
        }
    },
    selectedRowAction: {
        color: theme.palette.primary.contrastText + ' !important',
    },
    hoveredRowActionsCell: {
        minWidth: "100px"
    },
    contentList: {
        overflowY: 'scroll',
        overflowX: 'scroll',
        height: 'calc(100vh - 140px)',
        maxHeight:  'calc(100vh - 140px)'
    },
    row : {
        backgroundColor: '#f7f7f7',
        '&:hover': {
            backgroundColor: '#ebeaea !important',
        }

    },
    rowPair: {
        backgroundColor: '#f5f5f5',
        '&:hover': {
            backgroundColor: '#ebeaea !important',
        }
    },
    selectedRow: {
        backgroundColor: '#007cb0 !important',
    },
    selectedCell: {
        color: theme.palette.primary.contrastText + ' !important',
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
        padding: 0,
    },
    sortLabel:{
        color: '#1E1E1F',
    },
    noResults: {
        color: '#5E6565',
        fontWeight: 600
    },
    paddingCell: {
        paddingLeft: 5,
        paddingRight: 5,
    },
    nameCellWidth: {
        maxWidth: 400,
        ['@media (min-width: 576px)']: {
            maxWidth: 50
        },
        ['@media (min-width:780px)']: {
            maxWidth: 100
        },
        ['@media (min-width:992px)']: {
            maxWidth: 300
        },
        ['@media (min-width: 1200px)']: {
            maxWidth: 500
        }
    },

    tableButton: {
        padding: 0,
        margin: '0 !important'
    }
});

class ContentListTable extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            howeredRow: null
        };
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
            hoveredRow: $event.currentTarget != null ? $event.currentTarget.getAttribute("data-cm-node-path") : null
        })
    }

    onHoverExit($event) {
        // if (!this.props.contextualMenu.isOpen) {
            this.setState({
                hoveredRow: null
            });
        // }
    }

    contextualMenuClosed = () => {
        setTimeout(()=>{
            let hoveredEl = document.querySelector('tr[data-cm-role="table-content-list-row"]:hover');
            if (hoveredEl != null) {
                this.setState({
                    hoveredRow: hoveredEl.getAttribute("data-cm-node-path")
                });
            }
        }, 100);
    };

    renderLock(row) {
        let {classes, t} = this.props;
        return row.isLocked ?
            <Tooltip title={t('label.contentManager.locked')}><Lock className={classes.activeStatus}/></Tooltip> : null;
    }

    renderWip(row, dxContext) {
        let {classes, t, lang} = this.props;
        if (this.isWip(row, lang)) {
            return <Tooltip
                title={t('label.contentManager.workInProgress', {wipLang: dxContext.langName})}><VirtualsiteIcon
                className={classes.activeStatus}/></Tooltip>;
        }
        return null;
    }

    render() {

        const {hoveredRow} = this.state;
        const {rows, contentNotFound, page, pageSize, onChangeRowsPerPage,
            onChangePage, onRowSelected, selection, totalCount, t, classes,
            uiLang, handleSort, order, orderBy} = this.props;
        const emptyRows = pageSize - Math.min(pageSize, totalCount - page * pageSize);

        return (
            <div className={classes.contentList}>
                <Table aria-labelledby="tableTitle" data-cm-role="table-content-list">
                    <ContentListHeader
                        order={order}
                        orderBy={orderBy}
                        onRequestSort={handleSort}
                        columnData={columnData}
                        classes={classes}
                    />
                    <DxContext.Consumer>
                        {dxContext => (
                            <TableBody className={classes.tableBody}>
                                {contentNotFound ? <ContentNotFound classes={classes} translate={t}/> : _.isEmpty(rows) ? <EmptyRow classes={classes} translate={t}/> : rows.map((n, key) => {
                                    let isSelected = _.find(selection, item => item.path === n.path) !== undefined;
                                    let isHoveredRow = hoveredRow === n.path;
                                    let renderWip = this.renderWip(n, dxContext);
                                    let renderLock = this.renderLock(n);
                                    let icon = this.addIconSuffix(n.icon);
                                    let cellContentClasses = {root: isSelected ? classes.selectedCell : classes.cell};
                                    let context = {
                                        path: n.path,
                                        uuid: n.uuid,
                                        primaryNodeType: n.primaryNodeType,
                                        displayName: n.name,
                                        nodeName: n.nodeName,
                                    };
                                    return (
                                        <TableRow
                                            hover={true}
                                            className={isSelected ? '' : ((key % 2 === 0) ? classes.row : classes.rowPair)}
                                            classes={{root: classes.contentRow, selected: classes.selectedRow}}
                                            data-cm-node-path={n.path}
                                            key={n.uuid}
                                            onClick={() => onRowSelected([n])}
                                            selected={isSelected}
                                            data-cm-role="table-content-list-row"
                                            onMouseEnter={(event) => this.onHoverEnter(event)}
                                            onMouseLeave={(event) => this.onHoverExit(event)}
                                            onContextMenu={(event) => this.contextualMenu.context.onContextMenu(this.contextualMenu.context,event)}
                                            >
                                                <DisplayAction actionKey={"contextualMenuContent"} key={n.uuid} context={context} render={(contextualMenu) => {this.contextualMenu = contextualMenu; return false;}}/>
                                                <TableCell className={classes.publicationCell} data-cm-role="table-content-list-cell-publication">
                                                    <PublicationStatus node={n} publicationInfoWidth={400}/>
                                                </TableCell>
                                                {columnData.map(column => {
                                                    if (column.id === 'wip') {
                                                        return <TableCell className={classes.actionCell} key={column.id} padding={'none'}>
                                                            {renderWip}
                                                        </TableCell>;
                                                    } else if (column.id === 'lock') {
                                                        return <TableCell className={classes.actionCell} key={column.id} padding={'none'}>
                                                            {renderLock}
                                                        </TableCell>
                                                    } else if (column.id === 'name') {
                                                        return <TableCell key={column.id} data-cm-role="table-content-list-cell-name" className={classes.nameCellWidth}>
                                                            <Typography className={classes[column.id]} noWrap classes={cellContentClasses}>
                                                                <img src={icon} className={classes.nodeTypeIcon}/>
                                                                {n[column.id]}
                                                            </Typography>
                                                        </TableCell>;
                                                    } else if (column.id === 'lastModified') {
                                                        return <TableCell
                                                            key={column.id}
                                                            padding={'none'}
                                                            classes={{root: classes.paddingCell}}
                                                            data-cm-role={'table-content-list-cell-' + column.id}
                                                        >
                                                            <Typography className={classes[column.id]} classes={cellContentClasses}>
                                                                <Moment format={"ll"} locale={uiLang}>{n[column.id]}</Moment>
                                                            </Typography>
                                                        </TableCell>;
                                                    } else if (column.id === 'createdBy' && isHoveredRow) {
                                                        return <TableCell
                                                            className={classes.hoveredRowActionsCell}
                                                            classes={{root: classes.paddingCell }}
                                                            key={column.id} padding={'none'}
                                                            data-cm-role={'table-content-list-cell-' + column.id}
                                                        >
                                                            <DisplayActions target={"tableActions"} context={context} render={iconButtonRenderer({disableRipple:true, className:classes.tableButton + ' ' + classes.hoveredRowAction + ' ' + (isSelected ? classes.selectedRowAction : '')})}/>
                                                        </TableCell>;
                                                    } else {
                                                        return <TableCell
                                                            key={column.id}
                                                            padding={'none'}
                                                            classes={{root: classes.paddingCell}}
                                                            data-cm-role={'table-content-list-cell-' + column.id}
                                                        >
                                                            <Typography className={classes[column.id] + ' ' + classes.textOverflow1} classes={cellContentClasses}>
                                                                {n[column.id]}
                                                            </Typography>
                                                        </TableCell>;
                                                    }
                                                })}
                                            </TableRow>
                                    );
                                })}
                                {emptyRows > 0 &&
                                <TableRow>
                                    <TableCell colSpan={columnData.length + APP_TABLE_CELLS} padding={'none'}/>
                                </TableRow>
                                }
                            </TableBody>
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

let EmptyRow = (props) => {
    return <TableRow>
        <TableCell colSpan={columnData.length + APP_TABLE_CELLS} className={props.classes.noResults}>
            {props.translate("label.contentManager.noResults")}
        </TableCell>
    </TableRow>;
};

let ContentNotFound = (props) => {
    return <TableRow>
        <TableCell colSpan={columnData.length + APP_TABLE_CELLS} className={props.classes.noResults}>
            {props.translate("label.contentManager.contentNotFound")}
        </TableCell>
    </TableRow>;
};


const mapStateToProps = (state, ownProps) => ({
    selection: state.selection,
    uiLang : state.uiLang,
    lang : state.language
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    onRowSelected: (selection) => dispatch(cmSetSelection(selection)),
});

ContentListTable.propTypes = {
    rows: PropTypes.array.isRequired,
    page: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    onChangeRowsPerPage: PropTypes.func.isRequired,
    onChangePage: PropTypes.func.isRequired
};

ContentListTable = _.flowRight(
    withStyles(styles),
    translate(),
    connect(mapStateToProps, mapDispatchToProps)
)(ContentListTable);

export default ContentListTable;
