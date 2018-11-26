import React from 'react';
import ReactDOM from 'react-dom';
import ContentManager from './components/ContentManager';
import {CssBaseline} from '@material-ui/core';

function renderContentManager(target, id, dxContext) {
    ReactDOM.render(
        <React.Fragment>
            <CssBaseline/>
            <ContentManager id={id} dxContext={dxContext}/>
        </React.Fragment>, document.getElementById(target));
}

export {renderContentManager};
