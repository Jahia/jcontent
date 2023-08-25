import React, {useEffect} from 'react';
import {useNotifications} from '@jahia/react-material';
import {Formik} from 'formik';
import {EditPanel} from './EditPanel';
import {useTranslation} from 'react-i18next';
import {useContentEditorConfigContext, useContentEditorContext, useContentEditorSectionContext} from '~/ContentEditor/contexts';

import {validate} from '~/ContentEditor/validation';
import {createNode} from './createNode';
import {useApolloClient} from '@apollo/client';
import {triggerRefetchAll} from "~/JContent/JContent.refetches";

export const Create = () => {
    const notificationContext = useNotifications();
    const client = useApolloClient();
    const {t} = useTranslation('jcontent');
    const contentEditorConfigContext = useContentEditorConfigContext();
    const {onClosedCallback, contentType, lang, createCallback} = contentEditorConfigContext;
    const {nodeData, initialValues, title, i18nContext, createAnother} = useContentEditorContext();
    const {sections} = useContentEditorSectionContext();

    useEffect(() => {
        return () => {
            onClosedCallback();
        };
    }, [onClosedCallback]);

    const handleSubmit = (values, actions) => {
        return createNode({
            client,
            t,
            notificationContext,
            actions,
            data: {
                primaryNodeType: contentType,
                nodeData,
                sections,
                values,
                language: lang,
                i18nContext
            },
            createCallback: info => {
                createCallback(info, contentEditorConfigContext);
                triggerRefetchAll();
            }
        });
    };

    return (
        <Formik
            validateOnChange={false}
            validateOnBlur={false}
            initialValues={initialValues}
            validate={validate(sections)}
            onSubmit={handleSubmit}
        >
            {props => <EditPanel {...props} createAnother={createAnother} title={title}/>}
        </Formik>
    );
};
