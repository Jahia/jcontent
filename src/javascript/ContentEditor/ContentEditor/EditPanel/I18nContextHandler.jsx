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
    const previousLangRef = useRef(lang);

    useEffect(() => {
        formikRef.current = formik;
    }, [formik]);

    useEffect(() => {
        const langChanged = previousLangRef.current !== lang;
        previousLangRef.current = lang;

        if (i18nContext.shared || i18nContext[lang]) {
            const baseValues = {...formikRef.current.values};
            if (langChanged) {
                const i18nFieldNames = sections ?
                    getFields(sections).filter(field => field.i18n && !field.readOnly).map(field => field.name) :
                    [];
                i18nFieldNames.forEach(name => {
                    if (Object.prototype.hasOwnProperty.call(formikRef.current.initialValues, name)) {
                        baseValues[name] = formikRef.current.initialValues[name];
                    } else {
                        // Fully delete property if it doesn't exist and not just set to falsey
                        // as this affects formik's dirty state
                        delete baseValues[name];
                    }
                });
            }

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
