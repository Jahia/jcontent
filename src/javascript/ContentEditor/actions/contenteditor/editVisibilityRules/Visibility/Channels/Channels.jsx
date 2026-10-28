import React from 'react';
import PropTypes from 'prop-types';
import {Formik, useFormikContext} from 'formik';
import {Button} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {FieldSet} from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/FieldSet';
import styles from './Channels.scss';

export const CHANNELS_FIELDSET = 'jmix:channelSelection';

export const getChannelsFieldSet = sections => {
    const section = sections.find(s => s.name === 'visibility');
    const fieldSet = section?.fieldSets.find(fs => fs.name === CHANNELS_FIELDSET);
    if (!fieldSet) {
        return null;
    }

    if (fieldSet.dynamic && !fieldSet.hasEnableSwitch && !fieldSet.activated) {
        return null;
    }

    // We must hide fieldSet in the section when the fieldSet is not dynamic and
    // the fieldSet doesn't contain any fields (empty).
    return (fieldSet.dynamic || fieldSet.fields.length > 0) ? fieldSet : null;
};

// Save button dedicated to the Channels section. It is enabled only when the section has
// pending changes (Formik dirty state) and performs a real backend save on click.
const ChannelsSaveButton = () => {
    const {t} = useTranslation('jcontent');
    const {dirty, isSubmitting, submitForm} = useFormikContext();
    return (
        <Button
            color="accent"
            size="big"
            data-sel-role="channels-save-button"
            isDisabled={!dirty || isSubmitting}
            label={t('jcontent:label.contentEditor.edit.action.goBack.btnSave')}
            onClick={() => submitForm()}
        />
    );
};

export const Channels = ({sections, initialValues, onSubmit}) => {
    const fieldSet = getChannelsFieldSet(sections);
    if (!fieldSet) {
        return null;
    }

    return (
        <Formik initialValues={initialValues} onSubmit={onSubmit}>
            <div className={styles.container} data-sel-role="visibility-channels">
                <FieldSet fieldset={fieldSet}/>
                <div className={styles.rowEnd}>
                    <ChannelsSaveButton/>
                </div>
            </div>
        </Formik>
    );
};

Channels.propTypes = {
    sections: PropTypes.array.isRequired,
    initialValues: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired
};
