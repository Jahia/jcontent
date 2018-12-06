import React from 'react';
import {Checkbox, TableCell, TableHead, TableRow, TableSortLabel, Typography} from '@material-ui/core';
import {translate} from 'react-i18next';
import PropTypes from 'prop-types';
import {compose} from 'react-apollo';

class ContentListHeader extends React.Component {
    render() {
        const {order, orderBy, columnData, t, classes, setSort, showActions} = this.props;
        let direction = order === 'DESC' ? 'ASC' : 'DESC';
        return (
            <TableHead>
                <TableRow>
                    <TableCell padding="none"/>
                    <TableCell padding="none">
                        <Checkbox checked={false}/>
                    </TableCell>
                    {columnData.map(column => {
                        if (column.sortable) {
                            return (
                                <TableCell
                                    key={column.id}
                                    className={classes[column.id + 'Cell']}
                                    sortDirection={orderBy === column.property ? order.toLowerCase() : false}
                                >
                                    <TableSortLabel
                                        active={orderBy === column.property}
                                        direction={direction.toLowerCase()}
                                        onClick={() => setSort({order: direction, orderBy: column.property})}
                                    >
                                        <Typography noWrap variant="subtitle2">{t(column.label)}</Typography>
                                    </TableSortLabel>
                                </TableCell>
                            );
                        }
                        return (
                            <TableCell
                                key={column.id}
                                padding="none"
                                sortDirection={orderBy === column.property ? order.toLowerCase() : false}
                            >
                                <Typography noWrap variant="subtitle2">{t(column.label)}</Typography>
                            </TableCell>
                        );
                    }, this)}
                    {showActions &&
                        <TableCell component="th" scope="row">
                            <Typography variant="subtitle2">Actions</Typography>
                        </TableCell>
                    }
                </TableRow>
            </TableHead>
        );
    }
}

ContentListHeader.propTypes = {
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired
};

export default compose(
    translate(),
)(ContentListHeader);
