import React from 'react';
import ReactDOM from 'react-dom';
import ContentManager from './ContentManager';
import {CssBaseline} from '@material-ui/core';

function renderContentManager(target, id, dxContext) {
    window.parent.addEventListener('click', e => {
        if (Array.prototype.slice.call(window.parent.document.querySelectorAll('#JahiaGxtEditEnginePanel-usages a[target=\'_blank\'')).indexOf(e.target) > -1) {
            e.target.href = e.target.href.replace('contentmanager', 'preview');
        }
    });

    ReactDOM.render(
        <React.Fragment>
            <CssBaseline/>
            <ContentManager id={id} dxContext={dxContext}/>
        </React.Fragment>, document.getElementById(target));
}

export {renderContentManager};
