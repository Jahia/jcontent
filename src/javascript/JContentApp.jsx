import React from 'react';
import JContent from './JContent';
import {CssBaseline} from '@material-ui/core';
import {useI18nCMMNamespace} from './i18n';
import './date.config';

const JContentApp = () => {
    const {loading} = useI18nCMMNamespace();

    if (loading) {
        return '';
    }

    // No that by default site is always set to system site in ContentManage.jsx getHistory method
    return (
        <>
            <CssBaseline/>
            <JContent dxContext={window.contextJsParameters}/>
        </>
    );
};

export default JContentApp;
