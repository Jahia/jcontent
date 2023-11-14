import PropTypes from 'prop-types';
import React from 'react';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import {useTranslation} from 'react-i18next';
import {Button} from '@jahia/moonstone';
import styles from './Dialog.scss';
import {useDispatch} from 'react-redux';
import JContentConstants from '~/JContent/JContent.constants';
import {batchActions} from 'redux-batched-actions';
import {setTableViewMode} from '~/JContent/redux/JContent.redux';

export const NonDisplayableNodeDialog = ({node, isOpen, onClose, setPathAction, parentPage}) => {
    const {t} = useTranslation('jcontent');
    const dispatch = useDispatch();

    const handleParentNavigation = () => {
        dispatch(setPathAction(parentPage.path));
        onClose();
    };

    const handleListNavigation = () => {
        dispatch(batchActions([setTableViewMode(JContentConstants.tableView.viewMode.FLAT), setPathAction(node.path, {sub: false})]));
        onClose();
    };

    return (
        <Dialog open={isOpen}
                aria-labelledby="form-dialog-title"
                classes={{paper: styles.root}}
                onClose={onClose}
        >
            <DialogTitle id="form-dialog-title" className={styles.dialogTitle}>{t('jcontent:label.contentManager.contentPath.dialog.title')}</DialogTitle>
            <DialogContent className={styles.dialogContent}>
                <DialogContentText>
                    {t('jcontent:label.contentManager.contentPath.dialog.body')}
                </DialogContentText>
            </DialogContent>
            <DialogActions className={styles.dialogActions}>
                <Button label={t('jcontent:label.cancel')} size="big" data-cm-role="breadcrumb-cancel" onClick={onClose}/>
                <Button label={t('jcontent:label.contentManager.contentPath.dialog.listView')} size="big" color={parentPage ? 'default' : 'accent'} data-sel-role="view-list" onClick={handleListNavigation}/>
                {parentPage && <Button label={t('jcontent:label.contentManager.contentPath.dialog.parentPage')} size="big" color="accent" data-sel-role="view-parent" onClick={handleParentNavigation}/>}
            </DialogActions>
        </Dialog>
    );
};

NonDisplayableNodeDialog.propTypes = {
    node: PropTypes.object,
    parentPage: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    setPathAction: PropTypes.func
};

