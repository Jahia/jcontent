import React from 'react';
import PropTypes from 'prop-types';
import {Table, TableBody, TableBodyCell, TableRow, Typography} from '@jahia/moonstone';
import ContentTableConstants from './ContentTable.constants';
import ContentTableWrapper from './ContentTableWrapper';

const EmptyTable = ({columnSpan, t}) => (
    <ContentTableWrapper>
        <Table aria-labelledby="tableTitle" data-cm-role="table-content-list">
            <TableBody>
                <TableRow>
                    <TableBodyCell colSpan={columnSpan + ContentTableConstants.appTableCells + 2}>
                        <Typography weight="bold">{t('jcontent:label.contentManager.noResults')}</Typography>
                    </TableBodyCell>
                </TableRow>
            </TableBody>
        </Table>
    </ContentTableWrapper>
);

EmptyTable.propTypes = {
    columnSpan: PropTypes.number.isRequired,
    t: PropTypes.func.isRequired
};

export default EmptyTable;
