import React from 'react';
import PropTypes from 'prop-types';
import {SortIndicator, TableHead, TableHeadCell, TableRow} from '@jahia/moonstone';
import clsx from 'clsx';
import classes from '../ContentTable.scss';

export const ContentListHeader = ({headerGroups, headerClasses}) => (
    <TableHead>
        {headerGroups.map(headerGroup => (
            <TableRow key={'headerGroup' + headerGroup.id}
                      {...headerGroup.getHeaderGroupProps()}
                      className={classes.tableHeader}
            >
                {headerGroup.headers.map(column => (
                    <TableHeadCell key={column.id}
                                   {...column.getHeaderProps(column.getSortProps === undefined ? undefined : column.getSortProps())}
                                   data-cm-role={'table-content-list-header-cell-' + column.id}
                                   className={clsx({...classes, ...headerClasses}[`header-${column.id}`])}
                                   width={column.width}
                    >
                        {column.render('Header')}
                        {column.sortable && column.property && <SortIndicator isSorted={column.sorted} direction={column.sortDirection}/>}
                    </TableHeadCell>
                ))}
            </TableRow>
        ))}
    </TableHead>
);

ContentListHeader.propTypes = {
    headerGroups: PropTypes.array.isRequired,
    headerClasses: PropTypes.object
};

