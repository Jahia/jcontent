import React from "react";
import { TableHead, TableRow, TableCell, TableSortLabel } from "@material-ui/core";
import {translate} from "react-i18next";
import PropTypes from 'prop-types';

class ContentListHeader extends React.Component {

    handleSort = property => event => {
        this.props.onRequestSort(event, property);
    };

    render() {

        const { order, orderBy, columnData, t} = this.props;

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

ContentListHeader = translate()(ContentListHeader);

export default ContentListHeader;