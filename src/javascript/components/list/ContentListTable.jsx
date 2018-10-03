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
import {Pagination} from "@jahia/react-material";
import PropTypes from 'prop-types';
import * as _ from "lodash";
import {translate} from "react-i18next";
import {Lock, Build} from "@material-ui/icons";
import {DxContext} from "../DxContext";
import Actions from "../Actions";
import CmIconButton from "../renderAction/CmIconButton";
import PublicationStatus from '../publicationStatus/PublicationStatusComponent';
import Moment from 'react-moment';
import {cmSetSelection} from "../redux/actions";
import { invokeContextualMenu } from '../contextualMenu/redux/actions';
import {connect} from "react-redux";

const columnData = [
    {id: 'name', label: 'label.contentManager.listColumns.name'},
    {id: 'wip', label: ''},
    {id: 'lock', label: ''},
    {id: 'type', label: 'label.contentManager.listColumns.type'},
    {id: 'lastModified', label: 'label.contentManager.listColumns.lastModified'},
    {id: 'createdBy', label: 'label.contentManager.listColumns.createdBy'}
];

const APP_TABLE_CELLS = 2;

const styles = (theme) => ({
    type: {
        color: "#5E6565"
    },
    lastModified: {
        color: "#5E6565",
        minWidth: "140px",
        maxWidth: "140px"
    },
    createdBy: {
        color: "#5E6565",
        minWidth: "100px",
        maxWidth: "100px"
    },
    contentRow: {
        height: '36px!important',
        maxHeight: '36px!important',
        "&:hover td > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON": {
            width: 28,
            height: '36px!important',
            maxHeight: '36px!important',
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
        height: '30px!important',
        maxHeight: '30px!important',
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
        color: "#5E6565",
        maxWidth: "250px",
    },
    nodeTypeIcon: {
        marginRight: 5,
    },
    publicationCell: {
        position: 'relative',
        display: "flex",
        padding: 0,
        height: "37px!important",
        minHeight: 37 //same as row height
    },
    actionCell: {
        color: "#5E6565",
        minWidth: "38px"
    },
    hoveredRowAction: {
        paddingLeft: "3px",
        color: "#5E6565",
        '& svg': {
            width: "18px",
            height: "18px"
        }
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
        backgroundColor: '#efefef',
        height: '28px',
        maxHeight: '28px',
        minHeight: '28px',
        '&:hover': {
            height: '28px',
            maxHeight: '28px',
            minHeight: '28px',
            backgroundColor: '#dad9d9!important',
        },
    },
    rowPair: {
        backgroundColor: '#f5f5f5',
        height: '30px!important',
        maxHeight:  '30px!important',
        '&:hover': {
            height: '30px!important',
            maxHeight:  '30px!important',
            backgroundColor: '#dad9d9!important',
        },
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
});

class ContentListTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            order: 'asc',
            orderBy: 'name'
        };
    }

    handleRequestSort = (event, column) => {
        let order;
        if (this.state.orderBy === column) {
            if (this.state.order === 'asc') {
                order = 'desc';
            } else if (this.state.order === 'desc') {
                order = 'asc';
            }
        } else {
            order = 'asc';
        }

        this.setState({
            order: order,
            orderBy: column
        });
    };

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

    onHoverEnter($event, n) {
        this.setState({
            hoveredRow: n
        })
    }

    onHoverExit($event) {
        this.setState({
            hoveredRow: null
        })
    }

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

        const {order, orderBy, hoveredRow} = this.state;
        const {rows, page, pageSize, onChangeRowsPerPage, onChangePage, onRowSelected, selection, totalCount, t, classes, lang, handleShowPreview, onContextualMenu} = this.props;
        const emptyRows = pageSize - Math.min(pageSize, totalCount - page * pageSize);
        return (
            <div className={classes.contentList}>
                <Table aria-labelledby="tableTitle" data-cm-role="table-content-list">
                    <ContentListHeader
                        order={order}
                        orderBy={orderBy}
                        onRequestSort={this.handleRequestSort}
                        columnData={columnData}
                        classes={classes}
                    />
                    <DxContext.Consumer>
                        {dxContext => (
                            <TableBody className={classes.tableBody}>
                                {_.isEmpty(rows) ? <EmptyRow translate={t}/> : rows.map((n, key) => {
                                    let isSelected = _.find(selection, item => item.path === n.path) !== undefined;
                                    let isHoveredRow = hoveredRow === n.path;
                                    let renderWip = this.renderWip(n, dxContext);
                                    let renderLock = this.renderLock(n);
                                    let icon = this.addIconSuffix(n.icon);
                                        return (
                                        <TableRow
                                            hover={true}
                                            className={(key % 2 === 0) ? classes.row : classes.rowPair}
                                            classes={{root: classes.contentRow}}
                                            key={n.uuid}
                                            onClick={() => onRowSelected([n])}
                                            selected={isSelected}
                                            data-cm-role="table-content-list-row"
                                            onMouseEnter={($event) => this.onHoverEnter($event, n.path)}
                                            onMouseLeave={($event) => this.onHoverExit($event)}
                                            onContextMenu={(event) => {onContextualMenu({isOpen:true, event:event, menuId: "contextualMenuContentAction", path:n.path, uuid: n.uuid, nodeType: n.primaryNodeType, displayName: n.name, nodeName:n.nodeName})}}
                                        >
                                            <TableCell className={classes.publicationCell}
                                                       data-cm-role="table-content-list-cell-publication">
                                                <PublicationStatus node={n} publicationInfoWidth={400}/>
                                            </TableCell>
                                                {/*<PublicationStatus node={n} publicationInfoWidth={400}/>*/}
                                            {columnData.map(column => {
                                                if (column.id === 'wip') {
                                                    return <TableCell className={classes.actionCell} key={column.id}
                                                                      padding={'none'}>
                                                        {renderWip}
                                                    </TableCell>;
                                                } else if (column.id === 'lock') {
                                                    return <TableCell className={classes.actionCell} key={column.id}
                                                                      padding={'none'}>
                                                        {renderLock}
                                                    </TableCell>
                                                } else if (column.id === 'name') {
                                                    return <TableCell key={column.id}
                                                                      data-cm-role="table-content-list-cell-name">
                                                        <Typography className={classes[column.id]} noWrap>
                                                            <img src={icon} className={classes.nodeTypeIcon}/>
                                                            {n[column.id]}
                                                        </Typography>
                                                    </TableCell>;
                                                } else if (column.id === 'lastModified') {
                                                    return <TableCell key={column.id} padding={'none'}
                                                                      data-cm-role={'table-content-list-cell-' + column.id}>
                                                        <Typography className={classes[column.id]}>
                                                            <Moment format={"ll"} locale={lang}>{n[column.id]}</Moment>
                                                        </Typography>
                                                    </TableCell>;
                                                } else if (column.id === 'createdBy' && isHoveredRow) {
                                                    return <TableCell className={classes.hoveredRowActionsCell}
                                                                      key={column.id} padding={'none'}
                                                                      data-cm-role={'table-content-list-cell-' + column.id}>
                                                        <Actions menuId={"tablePublishMenu"} context={{
                                                            uuid: n.uuid,
                                                            path: n.path,
                                                            displayName: n.name,
                                                            nodeName: n.nodeName
                                                        }}>
                                                            {(props) => {
                                                                return <CmIconButton
                                                                    className={classes.hoveredRowAction} {...props}
                                                                    cmRole={"table-content-list-button-publish"}>
                                                                    <Autorenew/>
                                                                </CmIconButton>
                                                            }}
                                                        </Actions>
                                                        <CmIconButton className={classes.hoveredRowAction}
                                                                    data-cm-role={"table-content-list-button"}
                                                                    onClick={handleShowPreview}>
                                                            <Visibility/>
                                                        </CmIconButton>
                                                        <Actions menuId={"tableEditButtonAction"} context={{
                                                            uuid: n.uuid,
                                                            path: n.path,
                                                            displayName: n.name,
                                                            nodeName: n.nodeName
                                                        }}>
                                                            {(props) => {
                                                                return <CmIconButton
                                                                    className={classes.hoveredRowAction} {...props}
                                                                    cmRole={"table-content-list-button-edit"}>
                                                                    <Create/>
                                                                </CmIconButton>
                                                            }
                                                            }
                                                        </Actions>
                                                        <Actions menuId={"tableActions"} context={{
                                                            uuid: n.uuid,
                                                            path: n.path,
                                                            displayName: n.name,
                                                            nodeName: n.nodeName
                                                        }}>
                                                            {(props) => <CmIconButton
                                                                className={classes.hoveredRowAction} {...props}
                                                                cmRole={'table-content-list-action-menu'}/>}
                                                        </Actions>
                                                    </TableCell>;
                                                } else {
                                                    return <TableCell key={column.id} padding={'none'}
                                                                      data-cm-role={'table-content-list-cell-' + column.id}>
                                                        <Typography className={classes[column.id] + ' ' + classes.textOverflow1}>
                                                            {n[column.id]}
                                                        </Typography>
                                                    </TableCell>;
                                                }
                                            })}
                                        </TableRow>
                                    );
                                })}
                                {emptyRows > 0 &&
                                <TableRow style={{height: 49 * emptyRows}}>
                                    <TableCell colSpan={columnData.length + APP_TABLE_CELLS} padding={'none'} />
                                </TableRow>
                                }
                            </TableBody>
                        )}
                    </DxContext.Consumer>
                </Table>
                <Pagination totalCount={totalCount} pageSize={pageSize} currentPage={page}
                            onChangeRowsPerPage={onChangeRowsPerPage} onChangePage={onChangePage}/>
            </div>
        );
    }
}

let EmptyRow = (props) => {
    return <TableRow>
        <TableCell colSpan={columnData.length + APP_TABLE_CELLS}>
            {props.translate("label.contentManager.noResults")}
        </TableCell>
    </TableRow>;
};


const mapStateToProps = (state, ownProps) => ({
    selection: state.selection
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    onRowSelected: (selection) => dispatch(cmSetSelection(selection)),
    onContextualMenu: (params) => {
        dispatch(invokeContextualMenu(params));
    }
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
