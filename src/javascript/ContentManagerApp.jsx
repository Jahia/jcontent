import React from 'react';
import ReactDOM from 'react-dom';
import ContentManager from "./components/ContentManager";
import {CssBaseline} from "@material-ui/core";

// react is loaded by jnt_template/html/template.content-manager.jsp
window.reactRender = function(target, id, dxContext) {
    // this is needed by the react-loadable module to locate modules to load
    __webpack_public_path__ =  window.__webpack_public_path__;
    ReactDOM.render(
        <React.Fragment>
            <CssBaseline />
            <ContentManager id={id} dxContext={dxContext}/>
        </React.Fragment>, document.getElementById(target));
};