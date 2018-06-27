import React from "react";
import {withStyles} from '@material-ui/core';
import {translate} from 'react-i18next';

class CMLeftNavigation extends React.Component {

    render() {
        let {classes} = this.props;

        return (
            <div>
                <div>
                    <div>
                        <div className="collection-group-icon"/>
                        <h1>Contents</h1>
                    </div>
                    <div className="collection-group">
                        <div className="collection-entry">All Contents</div>
                        <div className="collection-entry">Planets</div>
                        <div>Species</div>
                    </div>
                </div>
            </div>
        )
    }
}

export default translate()(CMLeftNavigation);