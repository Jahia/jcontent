import React, {Component} from 'react';
import {translate} from "react-i18next";
import {MenuItem} from "@material-ui/core";
import {compose} from "react-apollo/index";

class CmMenuItem extends Component {

    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick(event) {
        let {menuClose, onClick} = this.props;
        menuClose();
        onClick(event);
    }

    render() {
        const {labelKey, labelParams, t} = this.props;
        return (
            <MenuItem onClick={(event) => this.onClick(event)}>
                {t(labelKey, labelParams)}
            </MenuItem>
        )
    }
}

CmMenuItem = compose(
    translate(),
)(CmMenuItem);

export default CmMenuItem;
