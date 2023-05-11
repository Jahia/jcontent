import PropTypes from 'prop-types';
import React from 'react';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import {useTranslation} from 'react-i18next';
import {Button} from '@jahia/moonstone';
import styles from './ContentPathDialog.scss';

export const ContentPathDialog = ({isOpen, handleClose, handleListView, handleParentPage}) => {
    const {t} = useTranslation('jcontent');
    return (
        <Dialog open={isOpen}
                aria-labelledby="form-dialog-title"
                classes={{paper: styles.root}}
                onClose={handleClose}
        >
            <DialogTitle id="form-dialog-title">{t('jcontent:label.contentManager.contentPath.dialog.title')}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {t('jcontent:label.contentManager.contentPath.dialog.body')}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button label={t('jcontent:label.cancel')} size="big" data-cm-role="breadcrumb-cancel" onClick={handleClose}/>
                <Button label={t('jcontent:label.contentManager.contentPath.dialog.listView')} size="big" data-cm-role="breadcrumb-view-list" onClick={handleListView}/>
                <Button label={t('jcontent:label.contentManager.contentPath.dialog.parentPage')} size="big" color="accent" data-cm-role="breadcrumb-view-parent" onClick={handleParentPage}/>
            </DialogActions>
        </Dialog>
    );
};

ContentPathDialog.propTypes = {
    handleClose: PropTypes.func.isRequired,
    handleListView: PropTypes.func.isRequired,
    handleParentPage: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
};

export default ContentPathDialog;
