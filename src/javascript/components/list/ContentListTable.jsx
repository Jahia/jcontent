import React from "react";
import {Table, TableBody, TableRow, TableCell, Button, withStyles} from "@material-ui/core";
import ContentListHeader from "./ContentListHeader";
import { Pagination } from "@jahia/react-material";
import PropTypes from 'prop-types';
import * as _ from "lodash";
import {compose} from "react-apollo/index";
import {translate} from "react-i18next";
import {InfoOutline, Lock, Build} from "@material-ui/icons";

const columnData = [
    {id: 'name', label: 'Name'},
    {id: 'type', label: 'Type'},
    {id: 'created', label: 'Created On'},
    {id: 'createdBy', label: 'Created By'}
];

const styles = (theme) => ({
    contentRow: {
        '&:hover $publicationStatus': {
            opacity: 1,
            transition: ["opacity", "0.25s"],
        }
    },
    toBePublished: {
        boxShadow: 'inset 7px 0px 0 0 #FB9926'
    },
    isPublished: {
        boxShadow: 'inset 7px 0px 0 0 #08D000'
    },
    neverPublished: {
        boxShadow: 'inset 7px 0px 0 0 #000000'
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
        justifyContent: 'left',
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
    publicationStatusToBePublished: {
        backgroundColor: '#FB9926',
        '&:hover': {
            backgroundColor: '#FB9926'
        }
    },
    publicationStatusPublished: {
        backgroundColor: '#08D000',
        '&:hover': {
            backgroundColor: '#08D000'
        }
    },
    publicationStatusNeverPublished: {
        backgroundColor: '#000000',
        '&:hover': {
            backgroundColor: '#000000'
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
    isDeleted: {
        textDecoration: 'line-through'
    }
});

class ContentListTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            order: 'asc',
            orderBy: ''
        };
    }

    handleRequestSort = (event, property) => {
        const orderBy = property;
        let order = 'desc';

        if (this.state.orderBy === property && this.state.order === 'desc') {
            order = 'asc';
        }

        this.setState({order, orderBy});
    };

    getPublicationStatus(node) {
        let { t } = this.props;
        if (node.isPublished) {
            return t("label.contentManager.publicationStatus.published", {userName: node.lastPublishedBy, timestamp: node.lastPublished});
        } else if (node.neverPublished) {
            return t("label.contentManager.publicationStatus.neverPublished");
        } else if (node.isModified) {
            return t("label.contentManager.publicationStatus.modified", {userName: node.modifiedBy, timestamp: node.lastModified});
        }
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

    render() {

        const {order, orderBy} = this.state;
        const {rows, page, pageSize, onChangeRowsPerPage, onChangePage, totalCount, match, t, classes, lang} = this.props;
        const emptyRows = pageSize - Math.min(pageSize, totalCount - page * pageSize);

        return (
            <div>
                <Table aria-labelledby="tableTitle">
                    <ContentListHeader
                        order={order}
                        orderBy={orderBy}
                        onRequestSort={this.handleRequestSort}
                        columnData={columnData}
                        path={match.url}
                    />
                    <TableBody>
                        {rows.map(n => {

                            let isPublished = n.isPublished;
                            let neverPublished = n.neverPublished;
                            let classWip = (this.isWip(n, lang) ? classes.activeStatus : classes.inactiveStatus);
                            let classLock = (n.isLocked ? classes.activeStatus : classes.inactiveStatus);
                            let deletionClass = (n.isMarkedForDeletion ? classes.isDeleted : '');

                            let contentRowClass = classes.contentRow;
                            let publicationStatusClass = classes.publicationStatus;
                            if (isPublished) {
                                contentRowClass = contentRowClass + ' ' + classes.isPublished;
                                publicationStatusClass = publicationStatusClass + ' ' + classes.publicationStatusPublished;
                            } else {
                                if (neverPublished) {
                                    contentRowClass = contentRowClass + ' ' + classes.neverPublished;
                                    publicationStatusClass = publicationStatusClass + ' ' + classes.publicationStatusNeverPublished;
                                } else {
                                    contentRowClass = contentRowClass + ' ' + classes.toBePublished;
                                    publicationStatusClass = publicationStatusClass + ' ' + classes.publicationStatusToBePublished;
                                }
                            }

                            return (
                                <TableRow hover={true} classes={{root: contentRowClass}} key={n.uuid}>
                                    <TableCell padding={'none'} classes={{root: classes.publicationStatusContainer}}>
                                        <Button disableRipple classes={{
                                            root: publicationStatusClass,
                                            label: classes.publicationStatusLabel
                                        }}>
                                            <InfoOutline color="primary" classes={{colorPrimary: classes.publicationStatusInfoIcon}}/>
                                            {this.getPublicationStatus(n)}
                                        </Button>
                                    </TableCell>
                                    {columnData.map(column => {
                                        let nameColumn = (column.id === 'name');
                                        return (
                                            <TableCell key={n.uuid + column.id} className={(nameColumn ? deletionClass : '')}>{n[column.id]}</TableCell>
                                        );
                                    })}
                                    <TableCell><Build className={classWip}/><Lock className={classLock}/></TableCell>
                                    <tableCell>
                                        <Button onClick={(event) => window.parent.editContent(n.path, n.name, ['jnt:content'], ['nt:base'])}>{t('label.contentManager.editAction')}</Button>
                                    </tableCell>
                                </TableRow>
                            );
                        })}
                        {emptyRows > 0 && (
                            <TableRow style={{height: 49 * emptyRows}}>
                                <TableCell colSpan={columnData.length}/>
                            </TableRow>
                        )}
                    </TableBody>
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
