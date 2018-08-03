import React, {Component} from 'react';
import {translate} from "react-i18next";
import {MenuItem} from "@material-ui/core";
import {compose} from "react-apollo/index";

class CmMenuItem extends Component {

    render() {
        const {labelKey, onClick, t} = this.props;
        return (
            <MenuItem onClick={(event) => onClick(event)}>
                {t(labelKey)}
            </MenuItem>
        )
    }
}

CmMenuItem = compose(
    translate(),
)(CmMenuItem);

export default CmMenuItem;
