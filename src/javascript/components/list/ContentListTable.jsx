import React from "react";
import {Table, TableBody, TableRow, TableCell, Button, withStyles} from "@material-ui/core";
import ContentListHeader from "./ContentListHeader";
import { Pagination } from "@jahia/react-material";
import PropTypes from 'prop-types';
import {compose} from "react-apollo/index";
import {translate} from "react-i18next";

const columnData = [
    {id: 'name', label: 'Name'},
    {id: 'type', label: 'Type'},
    {id: 'created', label: 'Created On'},
    {id: 'createdBy', label: 'Created By'}
];

const styles = (theme) =>({
    toBePublished: {
        boxShadow: 'inset 7px 0px 0 0 ' + '#FB9926'
    },
    isPublished: {
        boxShadow: 'inset 7px 0px 0 0 #08D000'
    },
});

class ContentListTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            order: 'asc',
            orderBy: '',
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

    render() {
        const {order, orderBy} = this.state;
        const {rows, page, pageSize, onChangeRowsPerPage, onChangePage, totalCount, match, t, classes} = this.props;
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
                        {rows.map((n, index) => {
                            let isPublished = n.isPublished;
                            return (
                                <TableRow
                                    hover classes={{hover: (isPublished ? classes.isPublished : classes.toBePublished)}}
                                    role="checkbox"
                                    tabIndex={-1}
                                    key={n.uuid}
                                >
                                    {columnData.map(column => {
                                    return (
                                        <TableCell key={n.uuid + column.id}>{n[column.id]}</TableCell>
                                    );
                                })}
                                <tableCell><Button onClick={(event) => window.parent.editContent(n.path, n.name, ['jnt:content'], ['nt:base'])}>{t('label.contentmanager.editAction')}</Button>
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
    (translate())
)(ContentListTable);

export default ContentListTable;
