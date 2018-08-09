import React from "react";
import {Table, TableBody, TableRow, TableCell, Button, withStyles, Typography, Tooltip, SvgIcon} from "@material-ui/core";
import ContentListHeader from "./ContentListHeader";
import { Pagination } from "@jahia/react-material";
import PropTypes from 'prop-types';
import * as _ from "lodash";
import {compose} from "react-apollo/index";
import {translate} from "react-i18next";
import {InfoOutline, Lock, Build} from "@material-ui/icons";
import {DxContext} from "../DxContext";
import { publicationStatusByName } from "../publicationStatus/publicationStatus"
import Actions from "../Actions";
import CmButton from "../renderAction/CmButton";
import CmIconButton from "../renderAction/CmIconButton";

import PublicationStatus from '../publicationStatus/PublicationStatusComponent';


const columnData = [
    {id: 'name', label: 'label.contentManager.listColumns.name'},
    {id: 'actions', label: ''},
    {id: 'type', label: 'label.contentManager.listColumns.type'},
    {id: 'created', label: 'label.contentManager.listColumns.created'},
    {id: 'createdBy', label: 'label.contentManager.listColumns.createdBy'}
];

const APP_TABLE_CELLS = 2;

const styles = (theme) => ({
    contentRow: {
        height: 56,
        "&:hover td > div.CM_PUBLICATION_STATUS > div.CM_PUBLICATION_INFO_BUTTON" : {
            width: 24
        }
    },
    publicationStatusContainer: {
        position: 'relative'
    },
    publicationStatus: {
        position: 'absolute',
        left: -23,
        top: 0,
        paddingLeft: theme.spacing.unit / 2,
        width: 30,
        minWidth: 30,
        height: '100%',
        overflow: 'hidden',
        justifyContent: 'flex-start',
        textTransform: 'none',
        opacity: 0,
        transition: ["opacity", "0.25s"],
        '&:hover': {
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
    inactiveStatus: {
        color: '#B2B2B2',
        opacity: '0.5',
        '&:hover': {
            opacity: '1'
        }
    },
    activeStatus: {
        color: '#FB9926',
        opacity: '0.9',
        '&:hover': {
            opacity: '1.5'
        }
    },
    name: {
        color: theme.palette.primary.main
    },
    nodeTypeIcon: {
        marginRight: 5,
    },
    publicationCell: {
        position: 'relative',
        display: "flex",
        padding: 0,
        borderBottom: "none",
        height: "inherit"
    }
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
        return (!icon.includes('.png') ? icon+'.png' : icon);
    }


    render() {

        const {order, orderBy} = this.state;
        const {rows, page, pageSize, onChangeRowsPerPage, onChangePage, onRowSelected, totalCount, t, classes, lang} = this.props;
        const emptyRows = pageSize - Math.min(pageSize, totalCount - page * pageSize);

        return (
            <div>
                <Table aria-labelledby="tableTitle" data-cm-role="table-content-list">
                    <ContentListHeader
                        order={order}
                        orderBy={orderBy}
                        onRequestSort={this.handleRequestSort}
                        columnData={columnData}
                    />
                    <DxContext.Consumer>
                        {dxContext => (
                            <TableBody>
                                {_.isEmpty(rows) ? <EmptyRow translate={t}/> : rows.map(n => {
                                    let publicationStatus = publicationStatusByName[n.publicationStatus];
                                    let classWip = (this.isWip(n, lang) ? classes.activeStatus : classes.inactiveStatus);
                                    let classLock = (n.isLocked ? classes.activeStatus : classes.inactiveStatus);
                                    let lockStatus = (n.isLocked ? t('label.contentManager.locked') : t('label.contentManager.lock'));
                                    let wipStatus = (this.isWip(n, lang) ? (n.wipStatus==='ALL_CONTENT' ? t('label.contentManager.workInProgressAll') :
                                        t('label.contentManager.workInProgress', {wipLang: dxContext.langName})) : t('label.contentManager.saveAsWip'));
                                    let icon = this.addIconSuffix(n.icon);
                                    return (
                                        <TableRow hover={true}
                                                  className={ classes.row }
                                                  classes={{root: classes.contentRow }}
                                                  key={n.uuid}
                                                  onClick={ () => onRowSelected(n)}
                                                  selected={ n.isSelected }
                                                  data-cm-role="table-content-list-row">
                                            <TableCell className={ classes.publicationCell }>
                                                <PublicationStatus node={ n }/>
                                            </TableCell>
                                            {columnData.map(column => {
                                                if(column.id === 'actions') {
                                                    return (<TableCell key={column.id} padding={'none'}>
                                                        <Tooltip title={wipStatus}><Build className={classWip}/></Tooltip>
                                                        <Tooltip title={lockStatus}><Lock className={classLock}/></Tooltip>
                                                    </TableCell>);
                                                } else if (column.id === 'name') {
                                                    return (<TableCell key={column.id} data-cm-role="table-content-list-cell-name">
                                                        <Typography className={classes[column.id]}>
                                                            <img src={icon} className={classes.nodeTypeIcon}/>
                                                            {n[column.id]}</Typography>
                                                    </TableCell>);
                                                } else {
                                                    return (
                                                        <TableCell key={column.id} padding={'none'} data-cm-role={'table-content-list-cell-' + column.id}>
                                                            <Typography className={classes[column.id]}>{n[column.id]}</Typography>
                                                        </TableCell>
                                                    );
                                                }
                                            })}
                                            <TableCell>
                                                <Actions menuId={"tableActions"} context={{path: n.path}}>
                                                    {(props) => <CmIconButton {...props}/>}
                                                </Actions>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {emptyRows > 0 && (
                                    <TableRow style={{height: 49 * emptyRows}}>
                                        <TableCell colSpan={columnData.length + APP_TABLE_CELLS} padding={'none'}/>
                                    </TableRow>
                                )}
                            </TableBody>
                        )}
                    </DxContext.Consumer>
                </Table>
                <Pagination totalCount={totalCount} pageSize={pageSize} currentPage={page} onChangeRowsPerPage={onChangeRowsPerPage} onChangePage={onChangePage}/>
            </div>
        );
    }
}

let EmptyRow = (props) => {
    return (
        <TableRow>
            <TableCell colSpan={columnData.length + APP_TABLE_CELLS}>{props.translate("label.contentManager.noResults")}</TableCell>
        </TableRow>
    )
};

ContentListTable.propTypes = {
    rows: PropTypes.array.isRequired,
    page: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    onChangeRowsPerPage: PropTypes.func.isRequired,
    onChangePage: PropTypes.func.isRequired,
};

ContentListTable = compose(
    withStyles(styles),
    translate()
)(ContentListTable);

export default ContentListTable;
