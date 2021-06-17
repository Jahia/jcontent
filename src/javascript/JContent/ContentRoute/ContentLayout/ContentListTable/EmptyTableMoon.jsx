import React from 'react';
import PropTypes from 'prop-types';
import {Table, TableBody, TableBodyCell, TableRow, Typography} from '@jahia/moonstone';
import ContentListTableConstants from './ContentListTable.constants';
import ContentListTableWrapper from './ContentListTableWrapper';

const EmptyTable = ({columnSpan, t}) => (
    <ContentListTableWrapper>
        <Table aria-labelledby="tableTitle" data-cm-role="table-content-list">
            <TableBody>
                <TableRow>
                    <TableBodyCell colSpan={columnSpan + ContentListTableConstants.appTableCells + 2}>
                        <Typography weight="bold">{t('jcontent:label.contentManager.noResults')}</Typography>
                    </TableBodyCell>
                </TableRow>
            </TableBody>
        </Table>
    </ContentListTableWrapper>
);

EmptyTable.propTypes = {
    columnSpan: PropTypes.number.isRequired,
    t: PropTypes.func.isRequired
};

export default EmptyTable;
