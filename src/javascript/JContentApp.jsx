import React from 'react';
import ContentManager from './ContentManager';
import {CssBaseline} from '@material-ui/core';
import {useI18nCMMNamespace} from './i18n';
import './date.config';

const JContentApp = () => {
    const {loading} = useI18nCMMNamespace();

    if (loading) {
        return 'Loading Content Media Manager';
    }

    // TODO there parameters need to come from jahia-ui-root context which should become accessible once dx-commons and jur is merged
    const ctx = {
        urlBrowser: '/modules/moonstone/cmm',
        urlbase: '/modules/moonstone/cmm', // This one goes right after context path
        langName: window.contextJsParameters.locale,
        uilang: window.contextJsParameters.locale,
        userName: window.contextJsParameters.user.fullname,
        workspace: window.contextJsParameters.workspace,
        contextPath: window.contextJsParameters.contextPath,
        siteKey: window.contextJsParameters.siteKey
    };

    // No that by default site is always set to system site in ContentManage.jsx getHistory method
    return (
        <>
            <CssBaseline/>
            <ContentManager dxContext={{
                siteDisplayableName: '',
                maxUploadSize: 10000000,
                displayWorkflowCounter: true,
                config: {
                    sql2CheatSheetUrl: '',
                    actions: [],
                    academyLink: '',
                    importAcademyLink: '',
                    ...window.contextJsParameters.config
                },
                ...ctx
            }}/>
        </>
    );
};

export default JContentApp;
