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

const messageRegistry = {
    'jnt:navMenuText': 'jcontent:label.contentManager.textMenu.editDialog',
    'jnt:contentFolder': 'jcontent:label.contentManager.contentFolder.dialog',
    default: 'jcontent:label.contentManager.contentPath.dialog'
};

export const NonDisplayableNodeDialog = ({node, isOpen, onClose, setPathAction, parentPage}) => {
    const {t} = useTranslation('jcontent');
    const dispatch = useDispatch();

    const handleParentNavigation = () => {
        if (setPathAction) {
            dispatch(setPathAction(parentPage.path));
        }
        onClose();
    };

    const handleListNavigation = () => {
        const actions = [setTableViewMode(JContentConstants.tableView.viewMode.FLAT)];
        if (setPathAction) {
            actions.push(setPathAction(node.path, {sub: false}))
        }
        dispatch(batchActions(actions));
        onClose();
    };

    const message = messageRegistry[node?.primaryNodeType?.name] ? messageRegistry[node?.primaryNodeType?.name] : messageRegistry.default;

    return (
        <Dialog
            fullWidth
            maxWidth="md"
            data-sel-role="node-content-dialog"
            open={isOpen}
            aria-labelledby="form-dialog-title"
            classes={{paper: styles.root}}
            onClose={onClose}
        >
            <DialogTitle id="form-dialog-title" className={styles.dialogTitle}>{t(`${message}.title`)}</DialogTitle>
            <DialogContent className={styles.dialogContent}>
                <DialogContentText>
                    {t(`${message}.body`)}
                </DialogContentText>
            </DialogContent>
            <DialogActions className={styles.dialogActions}>
                <Button label={t('jcontent:label.cancel')} size="big" data-sel-role="cancel-button" onClick={onClose}/>
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

