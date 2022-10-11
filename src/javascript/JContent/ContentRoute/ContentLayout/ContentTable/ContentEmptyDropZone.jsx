import React from 'react';
import PropTypes from 'prop-types';
import EmptyDropZone from '../EmptyDropZone';
import UploadTransformComponent from '../UploadTransformComponent';
import {Table, TableBody, TableBodyCell, TableRow} from '@jahia/moonstone';
import ContentTableWrapper from './ContentTableWrapper';
import styles from './ContentEmptyDropZone.scss';

export const ContentEmptyDropZone = ({path, uploadType}) => (
    <ContentTableWrapper>
        <Table aria-labelledby="tableTitle" data-cm-role="table-content-list">
            <TableBody>
                <UploadTransformComponent
                    uploadTargetComponent={TableRow}
                    uploadPath={path}
                    className={styles.dragZoneContentList}
                    uploadType={uploadType}
                >
                    <TableBodyCell className={styles.dragZone}>
                        <EmptyDropZone component="div" uploadType={uploadType}/>
                    </TableBodyCell>
                </UploadTransformComponent>
            </TableBody>
        </Table>
    </ContentTableWrapper>
);

ContentEmptyDropZone.propTypes = {
    uploadType: PropTypes.string,
    path: PropTypes.string.isRequired
};

export default ContentEmptyDropZone;
