import React from 'react';
import PropTypes from 'prop-types';
import {Table, TableBody, TableBodyCell, TableRow, Typography} from '@jahia/moonstone';
import ContentTableConstants from './ContentTable.constants';
import css from './ContentTable.scss';
import ContentTableWrapper from './ContentTableWrapper';

const ContentNotFound = ({columnSpan, t}) => (
    <ContentTableWrapper>
        <Table aria-labelledby="tableTitle" data-cm-role="table-content-list">
            <TableBody>
                <TableRow>
                    <TableBodyCell colSpan={columnSpan + ContentTableConstants.appTableCells} className={css.empty}>
                        <Typography weight="bold">
                            {t('jcontent:label.contentManager.contentNotFound')}
                        </Typography>
                    </TableBodyCell>
                </TableRow>
            </TableBody>
        </Table>
    </ContentTableWrapper>
);

ContentNotFound.propTypes = {
    columnSpan: PropTypes.number.isRequired,
    t: PropTypes.func.isRequired
};

export default ContentNotFound;
