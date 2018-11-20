import React from 'react';
import ReactDOM from 'react-dom';
import ContentManager from './components/ContentManager';
import {CssBaseline} from '@material-ui/core';

// React is loaded by jnt_template/html/template.content-manager.jsp
window.reactRender = function (target, id, dxContext) {
    ReactDOM.render(
        <React.Fragment>
            <CssBaseline/>
            <ContentManager id={id} dxContext={dxContext}/>
        </React.Fragment>, document.getElementById(target));
};
