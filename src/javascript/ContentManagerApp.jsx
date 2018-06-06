import React from 'react';
import ReactDOM from 'react-dom';
import ContentManager from "./components/ContentManager";

// react is loaded by jnt_template/html/template.content-manager.jsp
window.reactRender = function(target, id, dxContext) {
    ReactDOM.render(<div/>, document.getElementById(target));
};