import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Button} from '@jahia/moonstone';
import {useFormikContext} from 'formik';
import {isSaveDisabled} from './utils';

export const SaveEditedRuleButton = ({type}) => {
    const formikContext = useFormikContext();
    const {t} = useTranslation('jcontent');
    return (
        <Button size="big"
                color="accent"
                label={t('jcontent:label.contentEditor.edit.action.goBack.btnSave')}
                isDisabled={isSaveDisabled(type, formikContext.values)}
                onClick={() => {
        formikContext.submitForm();
    }}/>
    );
};

SaveEditedRuleButton.propTypes = {
    type: PropTypes.string
};
