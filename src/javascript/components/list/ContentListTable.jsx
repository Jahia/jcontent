import React from "react";
import {Table, TableBody, TableRow, TableCell, TablePagination} from "@material-ui/core";
import ContentListHeader from "./ContentListHeader";
import { Pagination } from "@jahia/react-material";

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
        const {order, orderBy, rowsPerPage} = this.state;
        const {rows, page, pageSize} = this.props;
        const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

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
                <Pagination totalCount={rows.length} pageSize={pageSize} currentPage={page} onChangeRowsPerPage={this.props.onChangeRowsPerPage} onChangePage={this.props.onChangePage}/>
            </div>
        );
    }
}

export default ContentListTable;
