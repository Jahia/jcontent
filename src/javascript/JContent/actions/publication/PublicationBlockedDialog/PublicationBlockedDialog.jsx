import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import {Button, Chip, Edit, Typography} from '@jahia/moonstone';
import {useApolloClient} from '@apollo/client';
import {enqueueSnackbar} from 'notistack';
import styles from './PublicationBlockedDialog.scss';
import JContentConstants from '~/JContent/JContent.constants';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';
import {groupPairsByNode} from '../getPublicationDecision';
import {getPairKey} from '../getMissingMandatoryProperties';
import {buildPublishMutation} from '../publication.gql-mutations';

const {MANDATORY_LANGUAGE_UNPUBLISHABLE, CONFLICT} = JContentConstants.availablePublicationStatuses;

/**
 * Groups (node, language) pairs by language, ordered like the site languages (unknown languages last)
 *
 * @param {array} pairs (node, language) pairs
 * @param {array} siteLanguages the site language objects, or null when unavailable
 * @returns {array} one {language, pairs} entry per language
 */
const groupPairsByLanguage = (pairs, siteLanguages) => {
    const pairsByLanguage = pairs.reduce((acc, pair) => {
        (acc[pair.language] = acc[pair.language] || []).push(pair);
        return acc;
    }, {});
    const siteOrder = (siteLanguages || []).map(siteLanguage => siteLanguage.language);
    return Object.keys(pairsByLanguage)
        .sort((language1, language2) => {
            const index1 = siteOrder.indexOf(language1);
            const index2 = siteOrder.indexOf(language2);
            if (index1 === -1 && index2 === -1) {
                return language1.localeCompare(language2);
            }

            if (index1 === -1 || index2 === -1) {
                return index1 === -1 ? 1 : -1;
            }

            return index1 - index2;
        })
        .map(language => ({language, pairs: pairsByLanguage[language]}));
};

/**
 * Moonstone replacement for the legacy GWT "missing mandatory property / conflict" publication confirmation.
 *
 * Blocked (node, language) pairs are grouped by language: each blocked language gets a section naming the
 * missing mandatory properties per node (or a generic note when the blocking comes from a descendant), with
 * an "Edit in <language>" shortcut opening Content Editor on the node in that language. Conflicts and
 * held-back languages (MANDATORY_LANGUAGE_VALID) get their own sections. The primary button publishes only
 * the pairs actually needing publication, and is disabled when nothing remains publishable.
 */
export const PublicationBlockedDialog = ({blockedPairs, heldBackPairs, pairsToPublish, missingPropertiesByPair, siteLanguages, isAllSubTree, onExit}) => {
    const {t} = useTranslation('jcontent');
    const client = useApolloClient();
    const [isOpen, setIsOpen] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);

    const hasPairsToPublish = pairsToPublish.length > 0;

    const unpublishablePairs = blockedPairs.filter(pair => pair.publicationStatus === MANDATORY_LANGUAGE_UNPUBLISHABLE);
    const conflictPairs = blockedPairs.filter(pair => pair.publicationStatus === CONFLICT);
    const blockedLanguageGroups = groupPairsByLanguage(unpublishablePairs, siteLanguages);
    // Ordered like the site languages, consistently with the blocked sections
    const orderedPairsToPublish = groupPairsByLanguage(pairsToPublish, siteLanguages).flatMap(group => group.pairs);

    const getSiteLanguage = language => (siteLanguages || []).find(siteLanguage => siteLanguage.language === language);
    const getLanguageLabel = language => {
        const siteLanguage = getSiteLanguage(language);
        return siteLanguage?.displayName ? `${siteLanguage.displayName} (${language})` : language.toUpperCase();
    };

    // The held-back languages wait for the mandatory languages that are incomplete, i.e. blocked; fall back
    // to every mandatory site language, then to the blocked language codes, if the site info is unavailable
    const blockedLanguageCodes = blockedLanguageGroups.map(group => group.language);
    const mandatorySiteLanguages = (siteLanguages || []).filter(siteLanguage => siteLanguage.mandatory);
    const incompleteMandatoryLanguages = mandatorySiteLanguages.filter(siteLanguage => blockedLanguageCodes.includes(siteLanguage.language));
    const heldBackByLanguages = (incompleteMandatoryLanguages.length > 0 ? incompleteMandatoryLanguages : mandatorySiteLanguages)
        .map(siteLanguage => siteLanguage.displayName || siteLanguage.language);
    const heldBackByNames = (heldBackByLanguages.length > 0 ? heldBackByLanguages : blockedLanguageCodes).join(', ');

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleEdit = pair => {
        // Close first: the dialog shows a pre-flight snapshot that would be stale after the edit;
        // Content Editor opens as its own modal (same mechanism as the double-click edit in page builder)
        setIsOpen(false);
        if (window.CE_API?.edit) {
            window.CE_API.edit({uuid: pair.uuid, lang: pair.language, isFullscreen: false});
        }
    };

    const handleContinue = () => {
        setIsPublishing(true);
        client.mutate({
            mutation: buildPublishMutation(groupPairsByNode(pairsToPublish)),
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

    const renderPairRow = (pair, children) => (
        <li key={`${pair.uuid}-${pair.language}`} data-sel-role="blocked-item">
            <div className={styles.itemHeader}>
                <div className={styles.itemNames}>
                    <Typography weight="bold">{pair.displayName}</Typography>
                    <Typography variant="caption" className={styles.itemPath}>{pair.path}</Typography>
                </div>
                <Button size="default"
                        variant="ghost"
                        icon={<Edit/>}
                        data-sel-role="edit-in-language"
                        label={t('jcontent:label.contentManager.publicationBlockedDialog.editInLanguage', {language: getLanguageLabel(pair.language)})}
                        onClick={() => handleEdit(pair)}/>
            </div>
            {children}
        </li>
    );

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
                <DialogContentText data-sel-role="blocked-intro">
                    {t('jcontent:label.contentManager.publicationBlockedDialog.intro')}
                </DialogContentText>
                {blockedLanguageGroups.map(group => (
                    <section key={group.language} className={styles.section} data-sel-role={`blocked-language-${group.language}`}>
                        <div className={styles.sectionHeader}>
                            <Typography variant="subheading" weight="bold">{getLanguageLabel(group.language)}</Typography>
                            {getSiteLanguage(group.language)?.mandatory &&
                                <Chip color="warning"
                                      data-sel-role="mandatory-language-chip"
                                      label={t('jcontent:label.contentManager.publicationBlockedDialog.mandatoryLanguage')}/>}
                        </div>
                        {missingPropertiesByPair === null &&
                            <Typography variant="caption">
                                {t('jcontent:label.contentManager.publicationStatus.mandatoryLanguageUnpublishable.description')}
                            </Typography>}
                        <ul className={styles.itemList}>
                            {group.pairs.map(pair => {
                                const missingProperties = missingPropertiesByPair?.[getPairKey(pair.uuid, pair.language)];
                                return renderPairRow(pair, (
                                    <>
                                        {missingProperties?.length > 0 &&
                                            <div className={styles.chipList}>
                                                <Typography variant="caption">
                                                    {t('jcontent:label.contentManager.publicationBlockedDialog.missingProperties')}
                                                </Typography>
                                                {missingProperties.map(property => (
                                                    <Chip key={property.name}
                                                          data-sel-role="missing-property"
                                                          label={property.displayName || property.name}/>
                                                ))}
                                            </div>}
                                        {missingProperties?.length === 0 &&
                                            <Typography variant="caption" data-sel-role="descendants-incomplete-note">
                                                {t('jcontent:label.contentManager.publicationBlockedDialog.descendantsIncomplete')}
                                            </Typography>}
                                    </>
                                ));
                            })}
                        </ul>
                    </section>
                ))}
                {conflictPairs.length > 0 &&
                    <section className={styles.section} data-sel-role="blocked-conflicts">
                        <div className={styles.sectionHeader}>
                            <Typography variant="subheading" weight="bold">
                                {t('jcontent:label.contentManager.publicationBlockedDialog.conflicts')}
                            </Typography>
                        </div>
                        <Typography variant="caption">
                            {t('jcontent:label.contentManager.publicationStatus.conflict.description')}
                        </Typography>
                        <ul className={styles.itemList}>
                            {conflictPairs.map(pair => renderPairRow(pair, null))}
                        </ul>
                    </section>}
                {heldBackPairs.length > 0 &&
                    <section className={styles.section} data-sel-role="held-back-languages">
                        <div className={styles.sectionHeader}>
                            <Typography variant="subheading" weight="bold">
                                {t('jcontent:label.contentManager.publicationBlockedDialog.heldBackTitle')}
                            </Typography>
                        </div>
                        <Typography variant="caption">
                            {t('jcontent:label.contentManager.publicationBlockedDialog.heldBackDescription', {languages: heldBackByNames})}
                        </Typography>
                        <ul className={styles.itemList}>
                            {heldBackPairs.map(pair => (
                                <li key={`${pair.uuid}-${pair.language}`} data-sel-role="held-back-item">
                                    <Typography>
                                        <strong>{pair.displayName}</strong> ({pair.path}) - {getLanguageLabel(pair.language)}
                                    </Typography>
                                </li>
                            ))}
                        </ul>
                    </section>}
                {hasPairsToPublish &&
                    <section className={styles.section} data-sel-role="languages-to-publish">
                        <div className={styles.sectionHeader}>
                            <Typography variant="subheading" weight="bold">
                                {t('jcontent:label.contentManager.publicationBlockedDialog.willBePublished')}
                            </Typography>
                        </div>
                        <ul className={styles.itemList}>
                            {orderedPairsToPublish.map(pair => (
                                <li key={`${pair.uuid}-${pair.language}`} data-sel-role="to-publish-item">
                                    <Typography>
                                        <strong>{pair.displayName}</strong> ({pair.path}) - {getLanguageLabel(pair.language)}
                                    </Typography>
                                </li>
                            ))}
                        </ul>
                    </section>}
                {!hasPairsToPublish &&
                    <DialogContentText data-sel-role="nothing-to-publish">
                        {t('jcontent:label.contentManager.publicationBlockedDialog.nothingToPublish')}
                    </DialogContentText>}
            </DialogContent>
            <DialogActions>
                <Button size="big"
                        isDisabled={isPublishing}
                        data-sel-role="cancel-button"
                        label={hasPairsToPublish ?
                            t('jcontent:label.contentManager.publicationBlockedDialog.cancel') :
                            t('jcontent:label.contentManager.publicationBlockedDialog.close')}
                        onClick={handleClose}/>
                <Button size="big"
                        isDisabled={isPublishing || !hasPairsToPublish}
                        color="accent"
                        data-sel-role="continue-button"
                        label={t('jcontent:label.contentManager.publicationBlockedDialog.publish')}
                        onClick={handleContinue}/>
            </DialogActions>
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
    heldBackPairs: PropTypes.arrayOf(publicationPairPropType),
    pairsToPublish: PropTypes.arrayOf(publicationPairPropType).isRequired,
    missingPropertiesByPair: PropTypes.object,
    siteLanguages: PropTypes.arrayOf(PropTypes.shape({
        language: PropTypes.string.isRequired,
        displayName: PropTypes.string,
        mandatory: PropTypes.bool,
        activeInEdit: PropTypes.bool
    })),
    isAllSubTree: PropTypes.bool.isRequired,
    onExit: PropTypes.func.isRequired
};

PublicationBlockedDialog.defaultProps = {
    heldBackPairs: [],
    missingPropertiesByPair: null,
    siteLanguages: null
};

export default PublicationBlockedDialog;
