import React from "react";
import { TableHead, TableRow, TableCell, TableSortLabel, withStyles } from "@material-ui/core";
import {translate} from "react-i18next";
import PropTypes from 'prop-types';
import {compose} from "react-apollo/index";

class ContentListHeader extends React.Component {

    handleSort = property => event => {
        this.props.onRequestSort(event, property);
    };

    render() {

        const { order, orderBy, columnData, t, classes} = this.props;
        return (
            <TableHead className={classes.head}>
                <TableRow className={classes.row}>
                    <TableCell />
                    {columnData.map(column => {
                        return (
                            <TableCell
                                key={column.id}
                                className={classes[column.id] + ' ' + classes.tableCellHeight}
                                sortDirection={orderBy === column.id ? order : false}
                            >
                                <TableSortLabel
                                    active={orderBy === column.id}
                                    direction={order}
                                    onClick={() => this.handleSort(column.id)}
                                >
                                    {t(column.label)}
                                </TableSortLabel>
                            </TableCell>
                        );
                    }, this)}
                </TableRow>
            </TableHead>
        );
    }
}

ContentListHeader.propTypes = {
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired,
};

ContentListHeader = compose(
    translate(),
)(ContentListHeader);


export default ContentListHeader;