import React from 'react';
import ContentManager from './ContentManager';
import {CssBaseline} from '@material-ui/core';

import './date.config';

window.parent.addEventListener('click', e => {
    if (Array.prototype.slice.call(window.parent.document.querySelectorAll('#JahiaGxtEditEnginePanel-usages a[target=\'_blank\'')).indexOf(e.target) > -1) {
        e.target.href = e.target.href.replace('contentmanager', 'preview');
    }
});

const ContentManagerApp8 = () => {
    return (
        <>
            <CssBaseline/>
            <ContentManager id="fakeId"
                            dxContext={{
                siteKey: 'mySite',
                siteDisplayableName: 'My site',
                urlBrowser: '/cmm',
                urlbase: '/modules/moonstone',
                langName: 'en',
                uiLang: 'en',
                userName: 'root',
                workspace: 'default',
                maxUploadSize: 40,
                displayWorkflowCounter: true,
                config: {
                    sql2CheatSheetUrl: '',
                    actions: [],
                    academyLink: '',
                    importAcademyLink: ''
                }
            }}/>
        </>
    );
};

export default ContentManagerApp8;
