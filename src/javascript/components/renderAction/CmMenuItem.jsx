import React, {Component} from 'react';
import {translate} from "react-i18next";
import {ArrowRight} from '@material-ui/icons';
import {MenuItem} from "@material-ui/core";
import {compose} from "react-apollo/index";

class CmMenuItem extends Component {

    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.state = {
            anchorEl: null,
        };
    }
    anchor = null;
    onClick(event) {
        let {menuClose, onClick, menuId} = this.props;
        !menuId && menuClose();
        onClick(event);
    }

    render() {
        const {menuId, labelKey, labelParams, labelHtml, t} = this.props;
        return (
            <MenuItem onClick={(event) => this.onClick(event)}>
                {!labelHtml && t(labelKey, labelParams)}
                {labelHtml && <span dangerouslySetInnerHTML={{__html: labelHtml}}/>}
                {menuId &&
                    <ArrowRight/>
                }
            </MenuItem>
        )
    }
}

CmMenuItem = compose(
    translate(),
)(CmMenuItem);

export default CmMenuItem;
