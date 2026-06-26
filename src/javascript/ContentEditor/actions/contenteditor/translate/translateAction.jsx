import React from 'react';
import PropTypes from 'prop-types';
import {useContentEditorApiContext} from '../../../contexts';
import {useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import {TranslatePanel} from './TranslatePanel';
import {useTranslateFormDefinition} from './useTranslateFormDefinition';

export const TranslateActionComponent = ({path, render: Render, ...otherProps}) => {
    const api = useContentEditorApiContext();
    const lang = useSelector(state => state.language);
    const res = useNodeChecks(
        {path: path, language: lang},
        {...otherProps, getSiteLanguages: true}
    );

    const languages = res.node?.site?.languages?.filter(l => l.activeInEdit) || [];
    const sourceLang = languages.find(l => l.language !== lang) || languages[0];
    return (res.loading) ? null : (
        <Render {...otherProps}
                isVisible={res.checksResult}
                enabled={languages.length > 1}
                onClick={() => {
                    // POC: A `versionCompareAction.jsx` would call api.edit() similarly but with:
                    //   sideBySideContext: { date: <selected date> }
                    //   lang: <current lang> (no language switching — both panels use the same lang)
                    //   layout: VersionComparePanel  (mirrors TranslatePanel but sides are swapped:
                    //     left = editable current form, right = read-only snapshot panel)
                    //   useFormDefinition: unchanged (left/main form is the standard edit form)
                    // The date comes from a dropdown populated by `availableSnapshotDates(uuid, locale)`.
                    // For the POC the date is hardcoded.
                    api.edit({
                        uuid: res.node.uuid,
                        lang: sourceLang.language,
                        isFullscreen: true,
                        dialogProps: {
                            classes: {},
                            dataSelRole: 'translate-dialog'
                        },
                        // POC: hardcoded date activates the snapshot path in SourceContentFormBuilder.
                        // Any non-null date value will do — the mock ignores it and uses the live node.
                        // Remove `date` to revert to the normal translate behaviour.
                        sideBySideContext: {lang, date: '2026-01-01'},
                        // SideBySideContext: {lang},
                        layout: TranslatePanel,
                        useFormDefinition: useTranslateFormDefinition
                    });
                }}
        />
    );
};

TranslateActionComponent.propTypes = {
    render: PropTypes.func.isRequired,
    path: PropTypes.string.isRequired
};

export const translateAction = {
    component: TranslateActionComponent
};
