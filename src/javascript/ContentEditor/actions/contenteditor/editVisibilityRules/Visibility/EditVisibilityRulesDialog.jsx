import React, {useCallback} from 'react';
import {Languages} from './Languages/Languages';
import {DateTime} from './DateTime';
import classes from './Visibility.scss';
import {useApolloClient, useQuery} from '@apollo/client';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import {VisibilityQuery} from './Visibility.gql-queries';
import {Button, Chip, Typography, Visibility} from '@jahia/moonstone';
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core';
import {DisplayAction} from '@jahia/ui-extender';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {ButtonRenderer} from '~/ContentEditor/utils';
import {useTranslation} from 'react-i18next';
import {ContentEditorConfigContextProvider, ContentEditorContextProvider} from '~/ContentEditor/contexts';
import {useEditFormDefinition} from '~/ContentEditor/ContentEditor/useEditFormDefinition';
import {updateNode} from '~/ContentEditor/ContentEditor/updateNode';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';
import {useNotifications} from '@jahia/react-material';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {truncate} from '~/utils';
import {getInitialValues} from '~/ContentEditor/ContentEditor/useEditFormDefinition';
import {Channels, CHANNELS_FIELDSET, getChannelsFieldSet} from './Channels/Channels';

const getFieldSetSection = (sections, fieldSetName) => {
    const visibilitySection = sections.find(s => s.name === 'visibility');
    return {
        ...visibilitySection,
        fieldSets: visibilitySection.fieldSets.filter(fs => fs.name === fieldSetName)
    };
};

export const EditVisibilityRulesDialog = ({
    sections,
    isOpen,
    onCloseDialog,
    formik,
    contentEditorContext,
    contentEditorConfigContext
}) => {
    const {t} = useTranslation('jcontent');
    const {editCallback} = contentEditorConfigContext;
    const {lang, nodeData, i18nContext} = contentEditorContext;
    const {data, loading, refetch} = useQuery(VisibilityQuery, {
        variables: {
            path: nodeData.path,
            language: lang
        }, fetchPolicy: 'network-only'
    });
    const client = useApolloClient();
    const notificationContext = useNotifications();

    // Save one fieldset of the visibility section independently of the other sections and of
    // the Date/Time conditions: jmix:i18n (j:invalidLanguages) or jmix:channelSelection.
    const saveFieldSet = useCallback(fieldSetName => async (values, actions) => {
        const fieldSetSection = getFieldSetSection(sections, fieldSetName);

        const info = await updateNode({
            client,
            t,
            notificationContext,
            actions,
            data: {
                nodeData,
                sections: [fieldSetSection],
                values,
                language: lang,
                i18nContext
            },
            editCallback: cbInfo => {
                editCallback(cbInfo, contentEditorConfigContext);
                // Hard reFetch to be able to enable publication menu from jContent menu displayed in header
                client.reFetchObservableQueries();
                triggerRefetchAll();
                refetch();
            }
        });

        if (info) {
            // Reset the dirty state so the Save button becomes disabled again
            actions.resetForm({values});
        }

        return info;
    }, [sections, nodeData, client, t, notificationContext, lang, i18nContext, editCallback, contentEditorConfigContext, refetch]);

    if (loading || !data?.jcr?.nodeByPath) {
        return <LoaderOverlay/>;
    }

    // Keep only the initial values we need for the Languages formik context (j:invalidLanguages + WIP)
    const nodeByPath = data.jcr.nodeByPath;
    const invalidLanguages = nodeByPath.invalidLanguages?.values || [];
    const languagesInitialValues = {
        'jmix:i18n_j:invalidLanguages': invalidLanguages
    };
    languagesInitialValues[`${Constants.wip.fieldName}`] = formik.initialValues[Constants.wip.fieldName];

    // Keep only the channel fields and the mixin switch for the Channels formik context (+ WIP)
    const channelsFieldSet = getChannelsFieldSet(sections);
    const channelsInitialValues = {};
    if (channelsFieldSet) {
        const channelsValues = getInitialValues(nodeData, [getFieldSetSection(sections, CHANNELS_FIELDSET)]);
        [channelsFieldSet.name, ...channelsFieldSet.fields.map(f => f.name)]
            .filter(key => key in channelsValues)
            .forEach(key => {
                channelsInitialValues[key] = channelsValues[key];
            });
        channelsInitialValues[`${Constants.wip.fieldName}`] = formik.initialValues[Constants.wip.fieldName];
    }

    const isMatchingAllConditions = nodeByPath.conditionalVisibility.nodes.length > 0 ? nodeByPath.conditionalVisibility.nodes[0].isMatchingAllConditions.booleanValue : false;
    const isVisible = nodeByPath.isVisible;
    const isVisibleInLive = nodeByPath.liveVisibility !== null && nodeByPath.liveVisibility.isVisible;
    return (
        <ContentEditorConfigContextProvider config={contentEditorConfigContext}>
            <ContentEditorContextProvider useFormDefinition={useEditFormDefinition}>
                <Dialog
                    fullWidth
                    data-sel-role="edit-visibility-rules-dialog"
                    className={clsx(classes.dialog, classes.dialogOverflow)}
                    open={isOpen}
                    maxWidth="lg"
                    onClose={onCloseDialog}
                >
                    <div className={classes.header}>
                        <DialogTitle id="dialog-language-title" className={classes.titleContainer}>
                            <Typography isNoWrap
                                        variant="heading"
                                        weight="bold"
                                        className={classes.dialogTitle}
                            >
                                {t('label.contentEditor.visibilityTab.title', {name: truncate(nodeData.displayName, 40)})}
                            </Typography>
                        </DialogTitle>
                        {nodeData.hasWritePermission ?
                            <DisplayAction actionKey="publishAllRules"
                                           render={ButtonRenderer}
                                           nodeData={nodeData}/> :
                            <Chip data-sel-role="read-only-badge"
                                  label={t('label.readOnly')}
                                  icon={<Visibility/>}
                                  color="warning"
                            />}
                    </div>
                    <DialogContent className={classes.dialogContent}>

                        <div className={classes.container} data-cm-role="visibilityScreen">
                            <Languages sections={sections}
                                       initialValues={languagesInitialValues}
                                       onSubmit={saveFieldSet('jmix:i18n')}/>
                            <Channels sections={sections}
                                      initialValues={channelsInitialValues}
                                      onSubmit={saveFieldSet(CHANNELS_FIELDSET)}/>
                            <DateTime rules={nodeByPath.rules}
                                      refresh={refetch}
                                      node={nodeData}
                                      lang={lang}
                                      sections={sections}
                                      isMatchingAllConditions={isMatchingAllConditions}
                                      isVisible={isVisible}
                                      isVisibleInLive={isVisibleInLive}/>
                        </div>

                    </DialogContent>
                    <DialogActions className={classes.actions}>
                        <Button
                            size="big"
                            label={t('jcontent:label.contentEditor.close')}
                            onClick={onCloseDialog}/>
                    </DialogActions>
                </Dialog>
            </ContentEditorContextProvider>
        </ContentEditorConfigContextProvider>
    );
};

EditVisibilityRulesDialog.propTypes = {
    sections: PropTypes.array.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onCloseDialog: PropTypes.func.isRequired,
    formik: PropTypes.object.isRequired,
    contentEditorContext: PropTypes.object.isRequired,
    contentEditorConfigContext: PropTypes.object.isRequired
};
