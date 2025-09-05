import React, {useMemo, useState} from 'react';
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core';
import {Button, Dropdown, Typography, Warning} from '@jahia/moonstone';
import * as PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import styles from './CopyLanguageDialog.scss';
import {useApolloClient} from '@apollo/client';
import {EditFormQuery} from '~/ContentEditor/ContentEditor/edit.gql-queries';
import {getI18nFieldAndValues} from './copyLanguage.utils';
import {Constants} from '~/ContentEditor/ContentEditor.constants';

export const CopyLanguageDialog = ({
    language,
    availableLanguages,
    isOpen,
    onCloseDialog,
    uuid,
    formik,
    sideBySideContext,
    defaultLanguage
}) => {
    const client = useApolloClient();

    const getDataFromSelectedLanguage = async _language => {
        const variables = {
            uilang: _language,
            formik,
            language: _language,
            uuid: uuid,
            writePermission: `jcr:modifyProperties_default_${_language}`,
            childrenFilterTypes: Constants.childrenFilterTypes
        };

        const formAndData = await client.query({query: EditFormQuery, variables: variables});

        return getI18nFieldAndValues(formAndData);
    };

    const {t} = useTranslation('jcontent');
    const handleCancel = () => {
        onCloseDialog();
    };

    // Override selected option with sbsOption from translate action if it exists and use that as source language
    const sbsOption = availableLanguages
        .map(e => ({value: e.language, label: e.uiLanguageDisplayName}))
        .find(e => e.value === sideBySideContext.lang);

    const defaultLanguageOption = useMemo(() => {
        const availableLanguageOption = availableLanguages.find(al => al.language === defaultLanguage) || availableLanguages[0];
        if (availableLanguageOption) {
            return {
                label: availableLanguageOption.uiLanguageDisplayName,
                value: availableLanguageOption.language
            };
        }
    }, [defaultLanguage, availableLanguages]);

    const defaultOption = sbsOption || {
        label: t('jcontent:label.contentEditor.edit.action.copyLanguage.defaultValue'),
        value: 'void'
    };

    const [currentOption, setCurrentOption] = useState(defaultLanguageOption || defaultOption);

    const handleOnChange = (e, item) => {
        setCurrentOption(item);
        return true;
    };

    const handleApply = () => {
        getDataFromSelectedLanguage(currentOption.value).then(data => {
            for (const [key, value] of Object.entries(data)) {
                // Set to empty string if value is null or undefined to ensure field is cleared
                // This is necessary to avoid issues with formik not updating the field if the value is null
                // or undefined, as it will not trigger a change event
                formik.setFieldValue(key, value || '');
            }
        });

        onCloseDialog();
    };

    const isApplyDisabled = currentOption.value === 'void' || currentOption.label === language;

    return (
        <Dialog fullWidth
                data-sel-role="copy-language-dialog"
                aria-labelledby="alert-dialog-slide-title"
                open={isOpen}
                maxWidth="sm"
                classes={{paper: styles.dialog_overflowYVisible}}
                onClose={onCloseDialog}
        >
            <DialogTitle id="dialog-language-title">
                <Typography isUpperCase variant="heading" weight="bold" className={styles.dialogTitle}>
                    {t('jcontent:label.contentEditor.edit.action.copyLanguage.dialogTitle')}
                </Typography>
                <Typography variant="subheading" className={styles.dialogSubTitle}>
                    {t('jcontent:label.contentEditor.edit.action.copyLanguage.dialogSubTitle')}
                </Typography>
            </DialogTitle>
            <DialogContent className={styles.dialogContent} classes={{root: styles.dialogContent_overflowYVisible}}>
                <Typography className={styles.copyFromLabel}>
                    {t('jcontent:label.contentEditor.edit.action.copyLanguage.listLabel')}
                </Typography>
                {sbsOption ?
                    <Typography>{sbsOption.label}</Typography> :
                    <Dropdown
                        className={styles.language}
                        label={currentOption.label}
                        value={currentOption.value}
                        size="medium"
                        data-sel-role="from-language-selector"
                        isDisabled={Boolean(sbsOption)}
                        data={sbsOption || defaultLanguageOption ? availableLanguages.map(element => {
                            return {
                                value: element.language,
                                label: element.uiLanguageDisplayName
                            };
                        }) : [defaultOption]}
                        onChange={handleOnChange}
                    />}
                <Typography className={styles.label}>
                    {t('jcontent:label.contentEditor.edit.action.copyLanguage.currentLanguage')}
                </Typography>
                <Typography>{language}</Typography>
            </DialogContent>
            <DialogActions>
                <Typography className={styles.warningText}>
                    <Warning
                        className={styles.warningIcon}/> {t('jcontent:label.contentEditor.edit.action.copyLanguage.bottomText')}
                </Typography>
                <Button
                    size="big"
                    color="default"
                    label={t('jcontent:label.contentEditor.edit.action.copyLanguage.btnCancel')}
                    data-sel-role="cancel-button"
                    onClick={handleCancel}
                />
                <Button
                    size="big"
                    color="accent"
                    label={t('jcontent:label.contentEditor.edit.action.copyLanguage.btnApply')}
                    disabled={isApplyDisabled}
                    data-sel-role="apply-button"
                    onClick={handleApply}
                />
            </DialogActions>
        </Dialog>
    );
};

CopyLanguageDialog.propTypes = {
    formik: PropTypes.object.isRequired,
    language: PropTypes.string.isRequired,
    availableLanguages: PropTypes.array.isRequired,
    isOpen: PropTypes.bool.isRequired,
    uuid: PropTypes.string.isRequired,
    onCloseDialog: PropTypes.func.isRequired,
    sideBySideContext: PropTypes.shape({lang: PropTypes.string}),
    defaultLanguage: PropTypes.string.isRequired
};
