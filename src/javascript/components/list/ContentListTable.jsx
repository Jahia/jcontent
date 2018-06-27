import React from "react";
import {Table, TableBody, TableRow, TableCell, Button} from "@material-ui/core";
import ContentListHeader from "./ContentListHeader";
import { Pagination } from "@jahia/react-material";
import PropTypes from 'prop-types';
import ContentBrowser from "../ContentBrowser";
import {compose} from "react-apollo/index";
import {translate} from "react-i18next";

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
            orderBy: '',
            showBrowser: false
        };
    }

    handleShowBrowser = () => {
        this.setState((prevState, props) => {
            return {
                showBrowser: !prevState.showBrowser
            }
        })
    };

    handleRequestSort = (event, property) => {
        const orderBy = property;
        let order = 'desc';

        if (this.state.orderBy === property && this.state.order === 'desc') {
            order = 'asc';
        }

        this.setState({order, orderBy});
    };

    render() {
        const {order, orderBy, showBrowser} = this.state;
        const {rows, page, pageSize, onChangeRowsPerPage, onChangePage, totalCount, match, t} = this.props;
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
                        showBrowser={showBrowser}
                    >
                        <Button onClick={this.handleShowBrowser}>{showBrowser ? "Hide" : "Show"} Browser</Button>
                    </ContentListHeader>
                    <TableBody>
                        {rows.map((n, index) => {
                            return (
                                <TableRow
                                    hover
                                    role="checkbox"
                                    tabIndex={-1}
                                    key={n.uuid}
                                >
                                    {showBrowser && index == 0 ? <TableCell rowSpan={pageSize}><ContentBrowser match={match}/></TableCell> : ""}
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
    (translate())
)(ContentListTable);

export default ContentListTable;
