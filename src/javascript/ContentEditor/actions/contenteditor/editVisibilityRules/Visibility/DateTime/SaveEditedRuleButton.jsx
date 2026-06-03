import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button} from '@jahia/moonstone';
import {useFormikContext} from 'formik';

export const SaveEditedRuleButton = () => {
    const formikContext = useFormikContext();
    const {t} = useTranslation('jcontent');
    return (
        <Button size="big"
                label={t('jcontent:label.ok')}
                onClick={() => {
        formikContext.submitForm();
    }}/>
    );
};

SaveEditedRuleButton.propTypes = {};

