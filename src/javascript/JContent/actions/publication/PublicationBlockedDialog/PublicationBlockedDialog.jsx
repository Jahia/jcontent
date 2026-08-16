import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import {Button, Typography} from '@jahia/moonstone';
import {useApolloClient} from '@apollo/client';
import {enqueueSnackbar} from 'notistack';
import styles from './PublicationBlockedDialog.scss';
import JContentConstants from '~/JContent/JContent.constants';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';
import {groupPairsByNode} from '../getPublicationDecision';
import {buildPublishMutation} from '../publication.gql-mutations';

const statusDescriptionKeys = {
    [JContentConstants.availablePublicationStatuses.MANDATORY_LANGUAGE_UNPUBLISHABLE]: 'jcontent:label.contentManager.publicationStatus.mandatoryLanguageUnpublishable.description',
    [JContentConstants.availablePublicationStatuses.CONFLICT]: 'jcontent:label.contentManager.publicationStatus.conflict.description'
};

/**
 * Moonstone replacement for the legacy GWT "missing mandatory property / conflict" publication confirmation.
 * Lists the blocked (node, language) pairs grouped by status; Continue publishes only the surviving pairs,
 * Cancel aborts everything. When every pair is blocked, an informational variant with a single Close button
 * is shown instead.
 */
export const PublicationBlockedDialog = ({blockedPairs, survivingPairs, isAllSubTree, onExit}) => {
    const {t} = useTranslation('jcontent');
    const client = useApolloClient();
    const [isOpen, setIsOpen] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);

    const isAllBlocked = survivingPairs.length === 0;

    const blockedGroups = Object.keys(statusDescriptionKeys)
        .map(status => ({status, pairs: blockedPairs.filter(pair => pair.publicationStatus === status)}))
        .filter(group => group.pairs.length > 0);

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleContinue = () => {
        setIsPublishing(true);
        client.mutate({
            mutation: buildPublishMutation(groupPairsByNode(survivingPairs)),
            variables: {includeSubTree: isAllSubTree}
        }).then(() => {
            enqueueSnackbar(t('jcontent:label.contentManager.publicationStatus.notification.publish'), {autoHideDuration: 3000});
            triggerRefetchAll();
            setIsOpen(false);
        }).catch(error => {
            console.error('Error while publishing the non-blocked items', error);
            enqueueSnackbar(t('jcontent:label.contentEditor.edit.action.publish.error'), {autoHideDuration: 3000});
            setIsOpen(false);
        });
    };

    return (
        <Dialog maxWidth="md"
                open={isOpen}
                aria-labelledby="publication-blocked-dialog-title"
                data-sel-role="publication-blocked-dialog"
                onClose={handleClose}
                onExited={onExit}
        >
            <DialogTitle id="publication-blocked-dialog-title">
                <Typography variant="heading" weight="bold">
                    {t('jcontent:label.contentManager.publicationBlockedDialog.title')}
                </Typography>
            </DialogTitle>
            <DialogContent className={styles.content}>
                {blockedGroups.map(group => (
                    <div key={group.status} className={styles.group} data-sel-role={`blocked-group-${group.status}`}>
                        <Typography weight="bold">{t(statusDescriptionKeys[group.status])}</Typography>
                        <ul className={styles.itemList}>
                            {group.pairs.map(pair => (
                                <li key={`${pair.uuid}-${pair.language}`} data-sel-role="blocked-item">
                                    <Typography>
                                        <strong>{pair.displayName}</strong> ({pair.path}) - {pair.language.toUpperCase()}
                                    </Typography>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
                {!isAllBlocked &&
                    <DialogContentText data-sel-role="continue-question">
                        {t('jcontent:label.contentManager.publicationBlockedDialog.continueQuestion')}
                    </DialogContentText>}
            </DialogContent>
            {isAllBlocked ? (
                <DialogActions>
                    <Button size="big"
                            data-sel-role="close-button"
                            label={t('jcontent:label.contentManager.publicationBlockedDialog.close')}
                            onClick={handleClose}/>
                </DialogActions>
            ) : (
                <DialogActions>
                    <Button size="big"
                            isDisabled={isPublishing}
                            data-sel-role="cancel-button"
                            label={t('jcontent:label.contentManager.publicationBlockedDialog.cancel')}
                            onClick={handleClose}/>
                    <Button size="big"
                            isDisabled={isPublishing}
                            color="accent"
                            data-sel-role="continue-button"
                            label={t('jcontent:label.contentManager.publicationBlockedDialog.continue')}
                            onClick={handleContinue}/>
                </DialogActions>
            )}
        </Dialog>
    );
};

const publicationPairPropType = PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    path: PropTypes.string,
    displayName: PropTypes.string,
    language: PropTypes.string.isRequired,
    publicationStatus: PropTypes.string,
    allowedToPublishWithoutWorkflow: PropTypes.bool
});

PublicationBlockedDialog.propTypes = {
    blockedPairs: PropTypes.arrayOf(publicationPairPropType).isRequired,
    survivingPairs: PropTypes.arrayOf(publicationPairPropType).isRequired,
    isAllSubTree: PropTypes.bool.isRequired,
    onExit: PropTypes.func.isRequired
};

export default PublicationBlockedDialog;
