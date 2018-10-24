import React from "react";
import { TableHead, TableRow, TableCell, TableSortLabel, withStyles } from "@material-ui/core";
import {translate} from "react-i18next";
import PropTypes from 'prop-types';
import {compose} from "react-apollo/index";

class ContentListHeader extends React.Component {

    handleSort(order, orderBy){
        this.props.onRequestSort(order, orderBy);
    };

    render() {

        const { order, orderBy, columnData, t, classes} = this.props;
        let direction = order==="DESC" ? "ASC" : "DESC";
        return (
            <TableHead className={classes.head}>
                <TableRow className={classes.contentRow}>
                    <TableCell />
                    {columnData.map(column => {
                        if(column.sortable) {
                            return (
                                <TableCell
                                    classes={column.id !== 'createdBy' ? {root: classes.paddingCell} : {}}
                                    key={column.id}
                                    className={classes[column.id] + ' ' + classes.tableCellHeight}
                                    sortDirection={orderBy === column.property ? order.toLowerCase() : false}
                                >
                                    <TableSortLabel
                                        classes={{active: classes.sortLabel}}
                                        active={orderBy === column.property}
                                        direction={direction.toLowerCase()}
                                        onClick={() => this.handleSort(direction, column.property)}
                                    >
                                        {t(column.label)}
                                    </TableSortLabel>
                                </TableCell>
                            );
                        }else{
                            return(
                                <TableCell
                                key={column.id}
                                className={classes[column.id] + ' ' + classes.tableCellHeight}
                                sortDirection={orderBy === column.property ? order.toLowerCase() : false}>
                                    {t(column.label)}
                            </TableCell>
                            );
                        }
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