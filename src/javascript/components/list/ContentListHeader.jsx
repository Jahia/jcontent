import React from "react";
import { TableHead, TableRow, TableCell, Tooltip, TableSortLabel } from "@material-ui/core";
import PropTypes from 'prop-types';

class ContentListHeader extends React.Component {

    createSortHandler = property => event => {
        this.props.onRequestSort(event, property);
    };

    render() {
        const { order, orderBy, columnData} = this.props;

        return (
            <TableHead>
                <TableRow>
                    <TableCell padding={'none'}/>
                    {columnData.map(column => {
                        return (
                            <TableCell
                                key={column.id}
                                padding={column.disablePadding ? 'none' : 'default'}
                                sortDirection={orderBy === column.id ? order : false}
                            >
                                <Tooltip title="Sort" enterDelay={300}>
                                    <TableSortLabel
                                        active={orderBy === column.id}
                                        direction={order}
                                        onClick={this.createSortHandler(column.id)}
                                    >
                                        {column.label}
                                    </TableSortLabel>
                                </Tooltip>
                            </TableCell>
                        );
                    }, this)}
                    <TableCell>&nbsp;{/*empty cell for actions*/} </TableCell>
                </TableRow>
            </TableHead>
        );
    }
}

ContentListHeader.propTypes = {
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired,
};

export default ContentListHeader;