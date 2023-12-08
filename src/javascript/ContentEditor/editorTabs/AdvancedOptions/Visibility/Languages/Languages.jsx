import React, {useState} from 'react';
import {useContentEditorContext, useContentEditorSectionContext} from '~/ContentEditor/contexts';
import {Validation} from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/Validation';
import styles from './Languages.scss';
import stylesFieldset from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/FieldSet/FieldSet.scss';
import {Toggle} from '@jahia/design-system-kit';
import {useSiteInfo} from '@jahia/data-helper';
import {shallowEqual, useSelector} from 'react-redux';
import {Typography} from '@jahia/moonstone';
import {FieldContainer} from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/Field';
import {useTranslation} from 'react-i18next';
import PropTypes from 'prop-types';

const filterRegularFieldSets = fieldSets => {
    const showFieldSet = fieldSet => {
        if (!fieldSet || fieldSet.name !== 'jmix:i18n') {
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
            { fields.map(field =>
                <FieldContainer key={field.name} field={field}/>)}
        </div>
    );
};

LanguageSection.propTypes = {
    fields: PropTypes.array
};

export const Languages = ({invalidLanguages}) => {
    const {t} = useTranslation('jcontent');
    const {sections} = useContentEditorSectionContext();
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
    const {nodeData} = useContentEditorContext();
    const [activatedSection, setActivatedSection] = useState(invalidLanguages !== undefined && invalidLanguages.length > 0);
    const section = sections.filter(s => s.name === 'visibility');
    const fieldSets = filterRegularFieldSets(section[0].fieldSets);
    const handleChange = () => {
        setActivatedSection(!activatedSection);
    };

    if (error || loading) {
        return null;
    }

    console.log(siteInfo, nodeData);
    if (fieldSets.length === 0) {
        return null;
    }

    return (
        <div className={styles.container}>
            <Validation/>
            <section>
                <article>
                    <div className={stylesFieldset.fieldSetTitleContainer}>
                        <div className="flexRow_nowrap">
                            <Toggle
                                classes={{
                                    root: stylesFieldset.toggle
                                }}
                                data-sel-role-dynamic-fieldset="jmix:i18n"
                                id="jmix:i18n"
                                checked={activatedSection}
                                onChange={handleChange}
                            />
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
                    {activatedSection && <LanguageSection fields={fieldSets[0].fields}/>}
                </article>
            </section>
        </div>
    );
};

Languages.propTypes = {
    invalidLanguages: PropTypes.array
};
