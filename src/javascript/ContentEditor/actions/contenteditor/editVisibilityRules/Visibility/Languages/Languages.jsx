import React from 'react';
import stylesFieldset from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/FieldSet/FieldSet.scss';
import languagesStyles from './Languages.scss';
import {useSiteInfo} from '@jahia/data-helper';
import {shallowEqual, useSelector} from 'react-redux';
import {FieldContainer} from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/Field/Field.container';
import {useTranslation} from 'react-i18next';
import PropTypes from 'prop-types';
import {Button, Typography} from '@jahia/moonstone';
import {Formik, useFormikContext} from 'formik';

const filterRegularFieldSets = fieldSets => {
    const showFieldSet = fieldSet => {
        if (fieldSet?.name !== 'jmix:i18n') {
            return false;
        }

        if (fieldSet.dynamic && !fieldSet.hasEnableSwitch && !fieldSet.activated) {
            return false;
        }

        // We must hide fieldSet in the section when the fieldSet is not dynamic and
        // the fieldSet doesn't contain any fields (empty).
        return fieldSet.dynamic || fieldSet.fields.length > 0;
    };

    return fieldSets.filter(fs => showFieldSet(fs));
};

const LanguageSection = ({fields}) => {
    return (
        <div className={stylesFieldset.fields}>
            {fields.map(field =>
                <FieldContainer key={field.name} field={field} inputContext={{displayActions: false}}/>)}
        </div>
    );
};

LanguageSection.propTypes = {
    fields: PropTypes.array
};

// Save button dedicated to the Languages section. It is enabled only when the section has
// pending changes (Formik dirty state) and performs a real backend save on click.
const LanguagesSaveButton = () => {
    const {t} = useTranslation('jcontent');
    const {dirty, isSubmitting, submitForm} = useFormikContext();
    return (
        <Button
            color="accent"
            size="big"
            data-sel-role="languages-save-button"
            isDisabled={!dirty || isSubmitting}
            label={t('jcontent:label.contentEditor.edit.action.goBack.btnSave')}
            onClick={() => submitForm()}
        />
    );
};

export const Languages = ({sections, initialValues, onSubmit}) => {
    const {t} = useTranslation('jcontent');
    const {siteKey, displayLanguage, uiLanguage} = useSelector(state => ({
        siteKey: state.site,
        displayLanguage: state.language,
        uiLanguage: state.uilang
    }), shallowEqual);
    const {siteInfo, error, loading} = useSiteInfo({
        siteKey: siteKey,
        displayLanguage: displayLanguage,
        uiLanguage: uiLanguage
    });
    const section = sections.find(s => s.name === 'visibility');
    if (!section) {
        return null;
    }

    const fieldSets = filterRegularFieldSets(section.fieldSets);

    if (error || loading || siteInfo.languages.length <= 1) {
        return null;
    }

    if (fieldSets.length === 0) {
        return null;
    }

    if (fieldSets[0].fields[0].valueConstraints.length < 2) {
        return null;
    }

    const prepareFieldset = {
        ...fieldSets[0],
        displayName: t('jcontent:label.contentEditor.visibilityTab.languages.title')
    };

    return (
        <Formik initialValues={initialValues} onSubmit={onSubmit}>
            <article>
                <div className={stylesFieldset.fieldSetTitleContainer}>
                    <div className="flexRow_nowrap">
                        <div className="flexCol">
                            <Typography component="label"
                                        htmlFor="jmix:i18n"
                                        className={stylesFieldset.fieldSetTitle}
                                        variant="subheading"
                                        weight="bold"
                            >
                                {t('jcontent:label.contentEditor.visibilityTab.languages.title')}
                            </Typography>
                        </div>
                    </div>
                </div>
                <LanguageSection fields={prepareFieldset.fields}/>
                <div className={languagesStyles.rowEnd}>
                    <LanguagesSaveButton/>
                </div>
            </article>
        </Formik>
    );
};

Languages.propTypes = {
    sections: PropTypes.array,
    initialValues: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired
};
