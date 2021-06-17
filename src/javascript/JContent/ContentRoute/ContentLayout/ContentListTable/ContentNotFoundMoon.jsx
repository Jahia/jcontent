import React from 'react';
import PropTypes from 'prop-types';
import {Table, TableBody, TableBodyCell, TableRow, Typography} from '@jahia/moonstone';
import ContentListTableConstants from './ContentListTable.constants';
import css from './ContentListTableMoon.scss';
import ContentListTableWrapper from './ContentListTableWrapper';

const ContentNotFound = ({columnSpan, t}) => (
    <ContentListTableWrapper>
        <Table aria-labelledby="tableTitle" data-cm-role="table-content-list">
            <TableBody>
                <TableRow>
                    <TableBodyCell colSpan={columnSpan + ContentListTableConstants.appTableCells} className={css.empty}>
                        <Typography weight="bold">
                            {t('jcontent:label.contentManager.contentNotFound')}
                        </Typography>
                    </TableBodyCell>
                </TableRow>
            </TableBody>
        </Table>
    </ContentListTableWrapper>
);

ContentNotFound.propTypes = {
    columnSpan: PropTypes.number.isRequired,
    t: PropTypes.func.isRequired
};

export default ContentNotFound;
