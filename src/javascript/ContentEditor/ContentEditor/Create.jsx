import React, {useEffect, useMemo} from 'react';
import {useNotifications} from '@jahia/react-material';
import {Formik} from 'formik';
import {EditPanel} from './EditPanel/EditPanel';
import {useTranslation} from 'react-i18next';
import {useContentEditorConfigContext, useContentEditorContext, useContentEditorSectionContext} from '~/ContentEditor/contexts';

import {validate} from '~/ContentEditor/validation';
import {createNode} from './createNode';
import {useApolloClient} from '@apollo/client';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';
import {childrenLimitReachedOrExceeded} from '~/ContentEditor/actions/jcontent/createContent/createContent.utils';
import {JahiaRenderedModulesUtil} from '~/JContent/JContent.utils';
import '../contentEditor.scss';

export const Create = () => {
    const notificationContext = useNotifications();
    const client = useApolloClient();
    const {t} = useTranslation('jcontent');
    const contentEditorConfigContext = useContentEditorConfigContext();
    const {onClosedCallback, contentType, lang, createCallback, orderBefore} = contentEditorConfigContext;
    const {nodeData, initialValues, title, i18nContext, createAnother} = useContentEditorContext();
    const {sections} = useContentEditorSectionContext();

    // Enforce the parent's item-count limit (j:numberOfItems / jmix:listSizeLimit) while
    // "Create another" is used: the item currently in the form is child number childCount + 1,
    // so disable when saving it would reach the maximum. childCount is refreshed on each
    // create-another save via the create form query's network-only refetch.
    const disableCreateAnother = childrenLimitReachedOrExceeded(
        {
            'subNodesCount_nt:base': (nodeData?.['subNodesCount_nt:base'] || 0) + 1,
            'jmix:listSizeLimit': nodeData?.['jmix:listSizeLimit'],
            properties: nodeData?.limitProperty ? [{name: 'limit', value: nodeData.limitProperty.value}] : []
        },
        JahiaRenderedModulesUtil.getArea(nodeData?.path)?.limit
    );
    const createAnotherWithLimit = useMemo(
        () => (createAnother ? {...createAnother, disabled: disableCreateAnother} : createAnother),
        [createAnother, disableCreateAnother]
    );

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
            orderBefore,
            data: {
                primaryNodeType: contentType,
                nodeData,
                sections,
                values,
                language: lang,
                i18nContext
            },
            createCallback: info => {
                if (createAnother) {
                    document.querySelector('div[role="dialog"] form')?.scrollTo(0, 0);
                }

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
            {props => <EditPanel {...props} createAnother={createAnotherWithLimit} title={title}/>}
        </Formik>
    );
};
