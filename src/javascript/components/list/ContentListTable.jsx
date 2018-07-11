import React from "react";
import {Table, TableBody, TableRow, TableCell, Button, withStyles, Typography, Tooltip} from "@material-ui/core";
import ContentListHeader from "./ContentListHeader";
import { Pagination } from "@jahia/react-material";
import PropTypes from 'prop-types';
import * as _ from "lodash";
import {compose} from "react-apollo/index";
import {translate} from "react-i18next";
import {InfoOutline, Lock, Build} from "@material-ui/icons";
import {DxContext} from "../DxContext";
import {
    PublicationStatusMarkedForDeletion,
    PublicationStatusModified,
    PublicationStatusNotPublished,
    PublicationStatusPublished
} from "./publicationStatus"


const columnData = [
    {id: 'name', label: 'label.contentManager.listColumns.name'},
    {id: 'actions', label: ''},
    {id: 'type', label: 'label.contentManager.listColumns.type'},
    {id: 'created', label: 'label.contentManager.listColumns.created'},
    {id: 'createdBy', label: 'label.contentManager.listColumns.createdBy'}
];

const publicationStatusByName = {
    "NOT_PUBLISHED": new PublicationStatusNotPublished(),
    "PUBLISHED": new PublicationStatusPublished(),
    "MODIFIED": new PublicationStatusModified(),
    "MARKED_FOR_DELETION": new PublicationStatusMarkedForDeletion()
}

const styles = (theme) => ({
    contentRow: {
        '&:hover $publicationStatus': {
            opacity: 1,
            transition: ["opacity", "0.25s"]
        }
    },
    modified: {
        boxShadow: 'inset 7px 0px 0 0 ' + theme.palette.publicationStatus.modified.main
    },
    markedForDeletion: {
        boxShadow: 'inset 7px 0px 0 0 ' + theme.palette.publicationStatus.modified.main
    },
    published: {
        boxShadow: 'inset 7px 0px 0 0 ' + theme.palette.publicationStatus.published.main
    },
    notPublished: {
        boxShadow: 'inset 7px 0px 0 0 ' + theme.palette.publicationStatus.notPublished.main
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

    render() {

        const {order, orderBy} = this.state;
        const {rows, page, pageSize, onChangeRowsPerPage, onChangePage, totalCount, t, classes, lang} = this.props;
        const emptyRows = pageSize - Math.min(pageSize, totalCount - page * pageSize);

        return (
            <div>
                <Table aria-labelledby="tableTitle">
                    <ContentListHeader
                        order={order}
                        orderBy={orderBy}
                        onRequestSort={this.handleRequestSort}
                        columnData={columnData}
                    />
                    <DxContext.Consumer>
                        {value => (
                            <TableBody>
                                {rows.map(n => {

                                    let publicationStatus = publicationStatusByName[n.publicationStatus];
                                    let classWip = (this.isWip(n, lang) ? classes.activeStatus : classes.inactiveStatus);
                                    let classLock = (n.isLocked ? classes.activeStatus : classes.inactiveStatus);
                                    let lockStatus = (n.isLocked ? t('label.contentManager.locked') : t('label.contentManager.lock'));
                                    let wipStatus = (this.isWip(n, lang) ? (n.wipStatus==='ALL_CONTENT' ? t('label.contentManager.workInProgressAll') :
                                        t('label.contentManager.workInProgress', {wipLang: value.langName})) : t('label.contentManager.saveAsWip'));

                                    return (
                                        <TableRow hover={true} classes={{root: classes.contentRow + ' ' + publicationStatus.getContentClass(classes)}} key={n.uuid}>
                                            <TableCell padding={'checkbox'} classes={{root: classes.publicationStatusContainer}}>
                                                <Button disableRipple classes={{
                                                    root: classes.publicationStatus + ' ' + publicationStatus.getDetailsClass(classes),
                                                    label: classes.publicationStatusLabel
                                                }}>
                                                    <InfoOutline color="primary" classes={{colorPrimary: classes.publicationStatusInfoIcon}}/>
                                                    {publicationStatus.getDetailsMessage(n, t)}
                                                </Button>
                                            </TableCell>
                                            {columnData.map(column => {
                                                if(column.id === 'actions') {
                                                    return (<TableCell key={column.id} padding={'none'}>
                                                        <Tooltip title={wipStatus}><Build className={classWip}/></Tooltip>
                                                        <Tooltip title={lockStatus}><Lock className={classLock}/></Tooltip>
                                                    </TableCell>);
                                                } else {
                                                    return (
                                                        <TableCell key={column.id} padding={'none'}>
                                                            <Typography className={classes[column.id]}>{n[column.id]}</Typography>
                                                        </TableCell>
                                                    );
                                                }
                                            })}
                                            <TableCell>
                                                <Button onClick={(event) => window.parent.editContent(n.path, n.name, ['jnt:content'], ['nt:base'])}>{t('label.contentManager.editAction')}</Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {emptyRows > 0 && (
                                    <TableRow style={{height: 49 * emptyRows}}>
                                        <TableCell colSpan={columnData.length} padding={'none'}/>
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
