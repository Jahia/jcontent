import React from 'react';
import stylesFieldset from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/FieldSet/FieldSet.scss';
import './Languages.scss';
import {useSiteInfo} from '@jahia/data-helper';
import {shallowEqual, useSelector} from 'react-redux';
import {FieldContainer} from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/Field/Field.container';
import {useTranslation} from 'react-i18next';
import PropTypes from 'prop-types';
import {Typography} from '@jahia/moonstone';

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

export const Languages = ({sections}) => {
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
        </article>
    );
};

Languages.propTypes = {
    sections: PropTypes.array
};
