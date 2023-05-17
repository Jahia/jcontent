import React from 'react';
import PropTypes from 'prop-types';
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core';
import {Button, Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import styles from './LinkDialog.scss';
import {useDispatch} from 'react-redux';
import {batchActions} from 'redux-batched-actions';
import {setTableViewMode} from '~/JContent/redux/tableView.redux';
import JContentConstants from '~/JContent/JContent.constants';

export const TextMenuDialog = ({node, isOpen, onClose, setPathAction}) => {
    const {t} = useTranslation('jcontent');
    const dispatch = useDispatch();

    if (!node) {
        return <></>;
    }

    return (
        <Dialog
            fullWidth
            maxWidth="md"
            data-sel-role="link-content-dialog"
            open={isOpen}
            onClose={onClose}
        >
            <DialogTitle className={styles.dialogTitle}>
                {t('jcontent:label.contentManager.textMenu.editDialog.title')}
            </DialogTitle>
            <DialogContent>
                <Typography variant="subheading">
                    {t('jcontent:label.contentManager.textMenu.editDialog.body')}
                </Typography>
                <br/>
            </DialogContent>
            <DialogActions className={styles.dialogActions}>
                <Button
                    data-sel-role="cancel-button"
                    size="big"
                    label={t('jcontent:label.cancel')}
                    onClick={onClose}
                />
                <Button
                    data-sel-role="list-view-button"
                    size="big"
                    color="accent"
                    label={t('jcontent:label.contentManager.textMenu.editDialog.openInList')}
                    onClick={() => {
                        dispatch(batchActions([setTableViewMode(JContentConstants.tableView.viewMode.FLAT), setPathAction(node.path, {sub: false})]));
                        onClose();
                    }}
                />
            </DialogActions>
        </Dialog>
    );
};

TextMenuDialog.propTypes = {
    node: {
        path: PropTypes.string
    },
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    setPathAction: PropTypes.func
};
