import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button} from '@jahia/moonstone';
import {useFormikContext} from 'formik';

export const SaveEditedRuleButton = () => {
    const formikContext = useFormikContext();
    const {t} = useTranslation('jcontent');
    return (
        <Button size="big"
                color="accent"
                label={t('jcontent:label.contentEditor.edit.action.goBack.btnSave')}
                onClick={() => {
        formikContext.submitForm();
    }}/>
    );
};

SaveEditedRuleButton.propTypes = {};

