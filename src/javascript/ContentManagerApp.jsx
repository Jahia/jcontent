import React from 'react';
import ReactDOM from 'react-dom';
import ContentManager from './ContentManager';
import {CssBaseline} from '@material-ui/core';

import './date.config';
import {useI18nCMMNamespace} from './i18n';

export function renderContentManager(target, id, dxContext) {
    window.parent.addEventListener('click', e => {
        if (Array.prototype.slice.call(window.parent.document.querySelectorAll('#JahiaGxtEditEnginePanel-usages a[target=\'_blank\'')).indexOf(e.target) > -1) {
            e.target.href = e.target.href.replace('contentmanager', 'preview');
        }
    });

    const ContentMediaManager = () => {
        const {loading} = useI18nCMMNamespace();

        if (loading) {
            return '';
        }

        return (
            <>
                <CssBaseline/>
                <ContentManager id={id} dxContext={dxContext}/>
            </>
        );
    };

    ReactDOM.render(<ContentMediaManager/>, document.getElementById(target));
}
