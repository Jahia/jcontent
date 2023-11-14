import React from 'react';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {Dialog, DialogActions, DialogTitle} from '@material-ui/core';
import {Button} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {DisplayAction} from '@jahia/ui-extender';
import {ButtonRenderer} from '~/utils/getButtonRenderer';
import {useQuery} from '@apollo/client';
import {GetLinkData} from '~/JContent/NavigationDialogs/link.gql-queries';
import {ExternalLinkDialogContent} from './ExternalLinkDialogContent';
import {InternalLinkDialogContent} from './InternalLinkDialogContent';
import styles from './Dialog.scss';

function getLinkType(node) {
    return (node.primaryNodeType.name === 'jnt:externalLink') ? 'external' : 'internal';
}

export const LinkDialog = ({node, isOpen, onClose}) => {
    const {t} = useTranslation('jcontent');
    const language = useSelector(state => state.language);
    const {data} = useQuery(GetLinkData, {
        variables: {path: node?.path, language},
        skip: !node?.path
    });

    if (!node || !data) {
        return false;
    }

    const linkType = getLinkType(node);
    const DialogContentComp = (linkType === 'external') ?
        ExternalLinkDialogContent : InternalLinkDialogContent;

    return (
        <Dialog
            fullWidth
            maxWidth="md"
            data-sel-role="link-content-dialog"
            open={isOpen}
            onClose={onClose}
        >
            <DialogTitle className={styles.dialogTitle}>
                {t(`jcontent:label.contentManager.links.${linkType}.editDialog.title`)}
            </DialogTitle>
            <DialogContentComp node={node} data={data} className={styles.dialogContent}/>
            <DialogActions className={styles.dialogActions}>
                <Button
                    data-sel-role="cancel-button"
                    size="big"
                    label={t('jcontent:label.cancel')}
                    onClick={onClose}
                />
                <DisplayAction
                    data-sel-role="edit-button"
                    actionKey="edit"
                    path={node?.path}
                    render={ButtonRenderer}
                    buttonProps={{color: 'accent', size: 'big'}}
                    renderOnClick={onClose}
                />
            </DialogActions>
        </Dialog>
    );
};

LinkDialog.propTypes = {
    node: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};
