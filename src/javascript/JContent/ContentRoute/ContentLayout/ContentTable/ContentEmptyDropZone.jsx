import React from 'react';
import PropTypes from 'prop-types';
import EmptyDropZone from '../EmptyDropZone';
import UploadTransformComponent from '../UploadTransformComponent';
import {Table, TableBody, TableBodyCell, TableRow} from '@jahia/moonstone';
import ContentTableWrapper from './ContentTableWrapper';
import styles from './ContentEmptyDropZone.scss';

export const ContentEmptyDropZone = ({path, mode}) => (
    <ContentTableWrapper>
        <Table aria-labelledby="tableTitle" data-cm-role="table-content-list">
            <TableBody>
                <UploadTransformComponent
                    uploadTargetComponent={TableRow}
                    uploadPath={path}
                    className={styles.dragZoneContentList}
                    mode={mode}
                >
                    <TableBodyCell className={styles.dragZone}>
                        <EmptyDropZone component="div" mode={mode}/>
                    </TableBodyCell>
                </UploadTransformComponent>
            </TableBody>
        </Table>
    </ContentTableWrapper>
);

ContentEmptyDropZone.propTypes = {
    mode: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired
};

export default ContentEmptyDropZone;
