import React from "react";
import {Table, TableBody, TableRow, TableCell, TablePagination} from "@material-ui/core";
import ContentListHeader from "./ContentListHeader";
import { Pagination } from "@jahia/react-material";
import PropTypes from 'prop-types';

const columnData = [
    {id: 'name', label: 'Name'},
    {id: 'type', label: 'Type'},
    {id: 'created', label: 'Created On'},
    {id: 'createdBy', label: 'Created By'}
];

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

    render() {
        const {order, orderBy} = this.state;
        const {rows, page, pageSize, onChangeRowsPerPage, onChangePage} = this.props;
        const emptyRows = pageSize - Math.min(pageSize, rows.length - page * pageSize);

        return (
            <div>
                <Table aria-labelledby="tableTitle">
                    <ContentListHeader
                        order={order}
                        orderBy={orderBy}
                        onRequestSort={this.handleRequestSort}
                        columnData={columnData}
                    />
                    <TableBody>
                        {rows.map(n => {
                            return (
                                <TableRow
                                    hover
                                    role="checkbox"
                                    tabIndex={-1}
                                    key={n.uuid}
                                >{columnData.map(column => {
                                    return (
                                        <TableCell key={n.uuid + column.id}>{n[column.id]}</TableCell>
                                    );
                                }, this)}
                                </TableRow>
                            );
                        })}
                        {emptyRows > 0 && (
                            <TableRow style={{height: 49 * emptyRows}}>
                                <TableCell colSpan={6}/>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <Pagination totalCount={rows.length} pageSize={pageSize} currentPage={page} onChangeRowsPerPage={onChangeRowsPerPage} onChangePage={onChangePage}/>
            </div>
        );
    }
}

ContentListTable.propTypes = {
    rows: PropTypes.object.isRequired,
    page: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    onChangeRowsPerPage: PropTypes.object.isRequired,
    onChangePage: PropTypes.object.isRequired,
};

export default ContentListTable;
