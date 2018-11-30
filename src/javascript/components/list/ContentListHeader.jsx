import React from 'react';
import {TableHead, TableRow, TableCell, TableSortLabel} from '@material-ui/core';
import {CheckBoxOutlineBlank} from '@material-ui/icons';
import {translate} from 'react-i18next';
import PropTypes from 'prop-types';
import {compose} from 'react-apollo';

class ContentListHeader extends React.Component {
    render() {
        const {order, orderBy, columnData, t, classes, setSort} = this.props;
        let direction = order === 'DESC' ? 'ASC' : 'DESC';
        return (
            <TableHead className={classes.head}>
                <TableRow className={classes.contentRow}>
                    <TableCell padding="none" className={classes.tableCellHeight} classes={{root: classes.paddingCell}}/>
                    <TableCell className={classes.tableCellHeight + ' ' + classes.paddingCheckbox} padding="none" classes={{root: classes.paddingCell}}>
                        <CheckBoxOutlineBlank className={classes.colorCheckbox}/>
                    </TableCell>
                    {columnData.map(column => {
                        if (column.sortable) {
                            return (
                                <TableCell
                                    key={column.id}
                                    className={classes[column.id] + ' ' + classes.tableCellHeight}
                                    classes={{root: classes.paddingCell}}
                                    sortDirection={orderBy === column.property ? order.toLowerCase() : false}
                                    >
                                    <TableSortLabel
                                        classes={{active: classes.sortLabel}}
                                        active={orderBy === column.property}
                                        direction={direction.toLowerCase()}
                                        onClick={() => setSort({order: direction, orderBy: column.property})}
                                        >
                                        {t(column.label)}
                                    </TableSortLabel>
                                </TableCell>
                            );
                        }
                        return (
                            <TableCell
                                key={column.id}
                                padding="none"
                                classes={{root: classes.paddingCell}}
                                className={classes[column.id] + ' ' + classes.tableCellHeight}
                                sortDirection={orderBy === column.property ? order.toLowerCase() : false}
                                >
                                {t(column.label)}
                            </TableCell>
                        );
                    }, this)}
                    <TableCell component="th" scope="row" className={classes.tableCellWidthHead} classes={{root: classes.paddingCell}}/>
                    <TableCell component="th" scope="row" className={classes.tableCellHeight} classes={{root: classes.paddingCell + ' ' + classes.alignAction}}>
                        Actions
                    </TableCell>
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
