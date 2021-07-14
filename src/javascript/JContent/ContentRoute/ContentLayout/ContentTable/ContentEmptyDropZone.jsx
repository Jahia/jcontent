import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';
import EmptyDropZone from '../EmptyDropZone';
import UploadTransformComponent from '../UploadTransformComponent';
import {Table, TableBody, TableRow, TableBodyCell} from '@jahia/moonstone';
import ContentTableWrapper from './ContentTableWrapper';

const styles = theme => ({
    dragZoneContentList: {
        position: 'absolute',
        height: '57vh',
        width: '100%',
        display: 'flex',
        padding: theme.spacing.unit * 4
    },
    dragZone: {
        display: 'flex',
        padding: 0,
        width: '100%'
    }
});

export const ContentEmptyDropZone = ({classes, path, mode}) => (
    <ContentTableWrapper>
        <Table aria-labelledby="tableTitle" data-cm-role="table-content-list">
            <TableBody>
                <UploadTransformComponent
                    uploadTargetComponent={TableRow}
                    uploadPath={path}
                    className={classes.dragZoneContentList}
                    mode={mode}
                >
                    <TableBodyCell className={classes.dragZone}>
                        <EmptyDropZone component="div" mode={mode}/>
                    </TableBodyCell>
                </UploadTransformComponent>
            </TableBody>
        </Table>
    </ContentTableWrapper>
);

ContentEmptyDropZone.propTypes = {
    classes: PropTypes.object.isRequired,
    mode: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired
};

export default withStyles(styles)(ContentEmptyDropZone);
