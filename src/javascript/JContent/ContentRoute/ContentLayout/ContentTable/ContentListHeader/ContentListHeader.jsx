import React from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from 'react-i18next';
import {compose} from '~/utils';
import {SortIndicator, TableHead, TableHeadCell, TableRow} from '@jahia/moonstone';
import {columnWidths} from '../reactTable/columns';
import clsx from 'clsx';
import classes from '../ContentTable.scss';

export const ContentListHeader = ({headerGroups}) => {
    return (
        <TableHead>
            {headerGroups.map(headerGroup => (
                <TableRow key={'headerGroup' + headerGroup.id}
                          {...headerGroup.getHeaderGroupProps()}
                          className={classes.tableHeader}
                >
                    {headerGroup.headers.map(column => (
                        <TableHeadCell key={column.id}
                                       {...column.getHeaderProps(column.getSortProps())}
                                       className={clsx(classes[`header-${column.id}`])}
                                       width={columnWidths[column.id]}
                        >
                            {column.render('Header')}
                            {column.sortable && <SortIndicator isSorted={column.sorted} direction={column.sortDirection}/>}
                        </TableHeadCell>
                    ))}
                </TableRow>
            ))}
        </TableHead>
    );
};

ContentListHeader.propTypes = {
    headerGroups: PropTypes.array.isRequired
};

export default compose(
    withTranslation()
)(ContentListHeader);
