import React from "react";
import {Route} from "react-router";

class Routes extends React.Component {

    render() {

        let {basePath, browseRender, browseFilesRender, searchRender, sql2SearchRender} = this.props;

        return (
            <React.Fragment>
                <Route path={`${basePath}/browse`} render={props => browseRender(props)}/>
                <Route path={`${basePath}/browse-files`} render={props => browseFilesRender(props)}/>
                <Route path={`${basePath}/search`} render={props => searchRender(props)}/>
                <Route path={`${basePath}/sql2Search`} render={props => sql2SearchRender(props)}/>
            </React.Fragment>
        );
    }
}

export {Routes};