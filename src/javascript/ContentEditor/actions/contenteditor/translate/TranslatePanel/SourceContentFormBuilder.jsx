import React from 'react';
import {useTranslation} from 'react-i18next';
import {useResizeWatcher} from '../useResizeWatcher';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import {
    ContentEditorSectionContextProvider,
    useContentEditorConfigContext,
    useContentEditorContext
} from '~/ContentEditor/contexts';
import {Formik} from 'formik';
import {FormBuilder} from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/FormBuilder';
import {CeModalError} from '~/ContentEditor/ContentEditorApi/ContentEditorError';
import {useTranslationReadOnlyFormDefinition} from './useTranslateReadOnlyFormDefinition';
import PropTypes from 'prop-types';
import {getCapitalized, useSwitchLanguage} from '~/shared';
import {MenuItem, Typography} from '@jahia/moonstone';

/**
 * Displays read-only content from a source language on translation panel UI.
 * This component bypasses the ContentEditorContext for fetching data as it causes rendering loop issues,
 * and opted to fetch data directly using the useTranslationReadOnlyFormDefinition hook.
 */
export const SourceContentFormBuilder = () => {
    const {lang, uuid, contentType} = useContentEditorConfigContext();
    useResizeWatcher({columnSelector: 'left-column'});

    const {data, loading, error} = useTranslationReadOnlyFormDefinition({
        lang,
        uuid,
        contentType
    });

    if (loading) {
        return <LoaderOverlay/>;
    }

    if (error) {
        throw new CeModalError(error.message, {cause: error});
    }

    return (
        <ContentEditorSectionContextProvider formSections={data?.sections}>
            <SourceContentFormBuilderInner data={data}/>
        </ContentEditorSectionContextProvider>
    );
};

const MenuLabel = ({children}) => (
    <li>
        <Typography
            isUpperCase
            variant="caption"
            style={{
                padding:
                    'var(--moon-spacing-small) var(--moon-spacing-nano) var(--moon-spacing-nano)'
            }}
        >
            {children}
        </Typography>
    </li>
);

MenuLabel.propTypes = {
    children: PropTypes.node
};

/**
 * Renders the actual form UI for the source content in a translation workflow.
 * This inner component is needed to control the rendering of the form only when data is fetched and available.
 * This is necessary in order to properly align the fields using useResizeWatcher.
 */
const SourceContentFormBuilderInner = ({data}) => {
    const {t} = useTranslation('jcontent');
    useResizeWatcher({columnSelector: 'left-column', data});
    const switchLanguage = useSwitchLanguage();
    const {lang: currentLanguage} = useContentEditorConfigContext();

    const {i18nContext, nodeData, siteInfo} = useContentEditorContext();
    const translatedLangs = nodeData?.translationLanguages || [];
    const sourceLanguages = [];
    const missingTranslationLanguages = [];

    for (const item of siteInfo.languages) {
        const isTranslated =
            translatedLangs.includes(item.language) ||
            // Check if a translation during create is empty or not
            (i18nContext[item.language]?.values &&
                Object.values(i18nContext[item.language]?.values).some(
                    Boolean
                ));
        if (isTranslated) {
            sourceLanguages.push(item);
        } else {
            missingTranslationLanguages.push(item);
        }
    }

    return (
        <Formik initialValues={{...data?.initialValues}} onSubmit={() => {}}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr auto'}}>
                <FormBuilder mode="edit"/>
                <div style={{minWidth: 0}}>
                    <ul
                        style={{
                            position: 'sticky',
                            top: 0,
                            maxWidth: '140px',
                            overflow: 'auto'
                        }}
                    >
                        <MenuLabel>
                            {t(
                                'label.contentEditor.edit.action.translate.sourceLanguage'
                            )}
                        </MenuLabel>
                        {sourceLanguages.map(l => (
                            <MenuItem
                                key={l.language}
                                label={getCapitalized(l.uiLanguageDisplayName)}
                                isSelected={l.language === currentLanguage}
                                onClick={() => switchLanguage(l.language)}
                            />
                        ))}
                        <MenuLabel>
                            {t(
                                'label.contentEditor.edit.action.translate.untranslated'
                            )}
                        </MenuLabel>
                        {missingTranslationLanguages.map(l => (
                            <MenuItem
                                key={l.language}
                                isDisabled
                                label={getCapitalized(l.uiLanguageDisplayName)}
                            />
                        ))}
                    </ul>
                </div>
            </div>
        </Formik>
    );
};

SourceContentFormBuilderInner.propTypes = {
    data: PropTypes.oneOfType([
        PropTypes.shape({
            initialValues: PropTypes.object,
            sections: PropTypes.array
        }),
        PropTypes.oneOf([null])
    ])
};
