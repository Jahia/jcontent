import React from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from 'react-i18next';
import {compose} from '~/utils';
import {TableHeadCell, TableRow, TableHead, SortIndicator} from '@jahia/moonstone';

export const ContentListHeader = ({headerGroups}) => {
    return (
        <TableHead>
            {headerGroups.map(headerGroup => (
                <TableRow key={'headerGroup' + headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                        <TableHeadCell key={column.id} {...column.getHeaderProps(column.getSortProps())}>
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
    headerGroups: PropTypes.object.isRequired
};

export default compose(
    withTranslation()
)(ContentListHeader);
