import {useEffect, useRef} from 'react';
import {useFormikContext} from 'formik';
import {useContentEditorConfigContext, useContentEditorContext, useContentEditorSectionContext} from '~/ContentEditor/contexts';
import {getFields} from '~/ContentEditor/utils';

export const I18nContextHandler = () => {
    const formik = useFormikContext();
    const contentEditorConfigContext = useContentEditorConfigContext();
    const {lang, i18nContext, setI18nContext, initialValues} = useContentEditorContext();
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
                getFields(sections)
                    .filter(field => field.i18n && !field.readOnly)
                    .forEach(({name}) => {
                        if (Object.hasOwn(initialValues, name)) {
                            baseValues[name] = initialValues[name];
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
            // Emptying a field leaves the Validation banner on the outgoing language's errors:
            // both modes set validateOnChange=false, so nothing revalidates on its own.
            }, langChanged || i18nContext[lang]);
        }
    }, [contentEditorConfigContext, i18nContext, lang, sections, initialValues]);

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
