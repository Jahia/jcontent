import {useEffect, useRef} from 'react';
import {useFormikContext} from 'formik';
import {useContentEditorConfigContext, useContentEditorContext, useContentEditorSectionContext} from '~/ContentEditor/contexts';
import {getFields} from '~/ContentEditor/utils';

export const I18nContextHandler = () => {
    const formik = useFormikContext();
    const contentEditorConfigContext = useContentEditorConfigContext();
    const {lang, i18nContext, setI18nContext} = useContentEditorContext();
    const {sections} = useContentEditorSectionContext();
    const formikRef = useRef();

    useEffect(() => {
        formikRef.current = formik;
    }, [formik]);

    useEffect(() => {
        if (i18nContext.shared || i18nContext[lang]) {
            // I18n-scoped fields must not carry over the language just left: reset them to their
            // initial value before re-applying whatever was already saved for this language in
            // i18nContext[lang]. Without this, switching to a language visited for the first time
            // keeps the previous language's unsaved, still-in-formik text in those fields.
            const i18nFieldNames = sections ?
                getFields(sections).filter(field => field.i18n && !field.readOnly).map(field => field.name) :
                [];
            const baseValues = {...formikRef.current.values};
            i18nFieldNames.forEach(name => {
                baseValues[name] = formikRef.current.initialValues[name];
            });

            formikRef.current.setValues({
                ...baseValues,
                ...i18nContext.shared?.values,
                ...i18nContext[lang]?.values
            }, i18nContext[lang]);
        }
    }, [contentEditorConfigContext, i18nContext, lang, sections]);

    useEffect(() => {
        setI18nContext(prev => ({
            ...prev,
            memo: {
                ...prev.memo,
                count: (prev.memo?.count || 0) + 1
            }
        }));
    }, [lang, setI18nContext]);

    return false;
};
