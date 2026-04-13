import React, {useCallback} from 'react';
import {Languages} from './Languages/Languages';
import {DateTime} from './DateTime/DateTime';
import classes from './Visibility.scss';
import {useApolloClient, useMutation, useQuery} from '@apollo/client';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import {UpdateVisibilityRulesMutation, VisibilityQuery} from './Visibility.gql-queries';
import {Button, Chip, Typography, Visibility} from "@jahia/moonstone";
import {Dialog, DialogActions, DialogContent, DialogTitle} from "@material-ui/core";
import {DisplayAction} from "@jahia/ui-extender";
import clsx from "clsx";
import PropTypes from "prop-types";
import {ButtonRenderer} from "~/ContentEditor/utils";
import {useTranslation} from "react-i18next";
import {Formik} from "formik";
import {ContentEditorConfigContextProvider, ContentEditorContextProvider} from "~/ContentEditor/contexts";
import {useEditFormDefinition} from "~/ContentEditor/ContentEditor/useEditFormDefinition";
import {SaveButton} from "~/ContentEditor/CloseConfirmationDialog/SaveButton";
import {updateNode} from "~/ContentEditor/ContentEditor/updateNode";
import {triggerRefetchAll} from "~/JContent/JContent.refetches";
import {useNotifications} from "@jahia/react-material";
import {Constants} from "~/ContentEditor/ContentEditor.constants";
import {isArray} from "lodash";

export const EditVisibilityRulesDialog = ({
                                              sections,
                                              isOpen,
                                              onCloseDialog,
                                              formik,
                                              contentEditorContext,
                                              contentEditorConfigContext,
                                              ...props
                                          }) => {
    const {t} = useTranslation('jcontent');
    const {editCallback} = contentEditorConfigContext;
    const {lang, nodeData, initialValues, title, i18nContext} = contentEditorContext;
    const {data, loading, refetch} = useQuery(VisibilityQuery, {
        variables: {
            path: nodeData.path,
            language: lang,
        }, fetchPolicy: 'network-only'
    });
    const client = useApolloClient();
    const notificationContext = useNotifications();
    const [saveRules] = useMutation(UpdateVisibilityRulesMutation);

    const handleSubmit = useCallback((values, actions) => {
        const visibilitySectionOnly = sections.filter(s => s.name === 'visibility');
        visibilitySectionOnly[0].fieldSets.find(fs => fs.name === 'jmix:conditionalVisibility').dynamic = true;
        console.debug('Submitting form with values', values, 'and initialValues', initialValues, ' and visibility section', visibilitySectionOnly, 'for node', nodeData);

        // new rules are under RULES::new
        const newRules = values['RULES::new'] ? values['RULES::new'] : [];
        // transform new rules in an array of InputGqlVisibilityConditionInput
        const gqlNewRules = newRules.map(rule => {
            const gqlRule = {
                type: rule.type,
                properties: []
            };
            Object.keys(rule).forEach(key => {
                if (key !== 'type' && key !== 'uuid' && key !== 'username' && key !== 'timestamp') {
                    const item = {
                        name: key,
                    };
                    if (isArray(rule[key])) {
                      item.values = rule[key]
                    } else {
                        item.value = rule[key]
                    }
                    gqlRule.properties.push(item);
                }
            });
            return gqlRule;
        });
        // updated rules are under RULES::updated
        const updatedRules = values['RULES::updated'] ? values['RULES::updated'] : [];
        const gqlUpdatedRules = updatedRules.map(rule => {
            const gqlRule = {
                type: rule.type,
                uuid: rule.uuid,
                properties: []
            };
            Object.keys(rule).forEach(key => {
                if (key !== 'type' && key !== 'uuid' && key !== 'username' && key !== 'timestamp') {
                    const item = {
                        name: key,
                    };
                    if (isArray(rule[key])) {
                        item.values = rule[key]
                    } else {
                        item.value = rule[key]
                    }
                    gqlRule.properties.push(item);
                }
            });
            return gqlRule
        });
        // deleted rules are under RULES::deleted
        const deletedRules = values['RULES::deleted'] ? values['RULES::deleted'] : [];

        saveRules({
            variables: {
                uuid: nodeData.uuid,
                lang,
                newConditions: gqlNewRules,
                updatedConditions: gqlUpdatedRules,
                removedConditions: deletedRules,
                isMatchingAllConditions: values[`RULES::isMatchingAllConditions`] ? values[`RULES::isMatchingAllConditions`] : false
            }
        });

        return updateNode({
            client,
            t,
            notificationContext,
            actions,
            data: {
                nodeData,
                sections: visibilitySectionOnly,
                values,
                language: lang,
                i18nContext
            },
            editCallback: info => {
                const {originalNode, updatedNode} = info;

                editCallback(info, contentEditorConfigContext);
                // Hard reFetch to be able to enable publication menu from jContent menu displayed in header
                // Note that node cache is flushed in save.request.js, we should probably replace this operation with
                // Something less invasive as this one reloads ALL queries.
                if (originalNode.path === updatedNode.path) {
                    client.reFetchObservableQueries();
                    triggerRefetchAll();
                    refetch();
                }
            }
        });
    }, [client, t, notificationContext, editCallback, contentEditorConfigContext, lang, nodeData, sections, i18nContext]);

    if (loading) {
        return <LoaderOverlay/>;
    }


    // Keep only the initial values we need for the new formik context (languages and date/time rules) to avoid confusion with the formik context of the content editor form. (jmix:i18n_j:invalidLanguages)
    const nodeByPath = data.jcr.nodeByPath;
    const invalidLanguages = nodeByPath.invalidLanguages?.values;
    const formikFilteredInitialValues = {
        "jmix:i18n_j:invalidLanguages": invalidLanguages
    }
    formikFilteredInitialValues[`${Constants.wip.fieldName}`] = formik.initialValues[Constants.wip.fieldName];


    const isMatchingAllConditions = nodeByPath.conditionalVisibility.nodes.length > 0 ? nodeByPath.conditionalVisibility.nodes[0].isMatchingAllConditions.booleanValue : false;
    return (
        <ContentEditorConfigContextProvider config={contentEditorConfigContext}>
            <ContentEditorContextProvider useFormDefinition={useEditFormDefinition} context={contentEditorContext}>
                <Formik initialValues={formikFilteredInitialValues} onSubmit={handleSubmit}>
                    <Dialog
                        data-sel-role="edit-visibility-rules-dialog"
                        className={clsx(classes.dialog, classes.dialogOverflow)}
                        open={isOpen}
                        fullWidth={true}
                        maxWidth="lg"
                        onClose={onCloseDialog}
                    >
                        <div className={classes.header}>
                            <DialogTitle id="dialog-language-title" className={classes.titleContainer}>
                                <Typography variant="heading" weight="bold" className={classes.dialogTitle}
                                            isNoWrap={true}>
                                    {nodeData.displayName}
                                </Typography>
                            </DialogTitle>
                            {nodeData.hasWritePermission ?
                                <DisplayAction actionKey="publishAllRules" render={ButtonRenderer}
                                               nodeData={nodeData}/> :
                                <Chip data-sel-role="read-only-badge"
                                      label={t('label.readOnly')}
                                      icon={<Visibility/>}
                                      color="warning"
                                />}
                        </div>
                        <DialogContent className={classes.dialogContent}>

                            <div className={classes.container} data-cm-role="visibilityScreen">
                                <Languages invalidLanguages={invalidLanguages} sections={sections}/>
                                <DateTime rules={nodeByPath.rules} refresh={refetch}
                                          node={nodeData} sections={sections} isMatchingAllConditions={isMatchingAllConditions}/>
                            </div>

                        </DialogContent>
                        <DialogActions className={classes.actions}>
                            <SaveButton actionCallback={onCloseDialog} onCloseDialog={onCloseDialog}/>
                            <Button
                                size="big"
                                label={t('jcontent:label.contentEditor.close')}
                                onClick={onCloseDialog}/>
                        </DialogActions>
                    </Dialog>
                </Formik>
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
    contentEditorConfigContext: PropTypes.object.isRequired,
};
