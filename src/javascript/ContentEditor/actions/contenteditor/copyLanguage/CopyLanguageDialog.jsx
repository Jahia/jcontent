import React, {useState} from 'react';
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
    formik
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

    const defaultOption = {
        label: t('jcontent:label.contentEditor.edit.action.copyLanguage.defaultValue'),
        value: 'void'
    };

    const [currentOption, setCurrentOption] = useState(defaultOption);

    const handleOnChange = (e, item) => {
        setCurrentOption(item);
        return true;
    };

    const handleApply = () => {
        getDataFromSelectedLanguage(currentOption.value).then(data => {
            data.forEach(value => {
                formik.setFieldValue(`${value.definition.declaringNodeType.name}_${value.name}`, value.multiple ? value.values : value.value);
            });
        });

        onCloseDialog();
    };

    const isApplyDisabled = defaultOption.value === currentOption.value;

    return (
        <Dialog fullWidth
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
                <Dropdown
                    className={styles.language}
                    label={currentOption.label}
                    value={currentOption.value}
                    size="medium"
                    isDisabled={false}
                    data={[defaultOption].concat(availableLanguages.filter(element => element.displayName !== language).map(element => {
                        return {
                            value: element.language,
                            label: element.uiLanguageDisplayName
                        };
                    }))}
                    onChange={handleOnChange}
                />
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
                    onClick={handleCancel}
                />
                <Button
                    size="big"
                    color="accent"
                    label={t('jcontent:label.contentEditor.edit.action.copyLanguage.btnApply')}
                    disabled={isApplyDisabled}
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
    onCloseDialog: PropTypes.func.isRequired
};
