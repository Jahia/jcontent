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

        handleClick = (event: SyntheticEvent<HTMLElement>) => {
        event.stopPropagation();
        this.setState({
            open: true,
            anchorEl: this.anchor,
        });
    }

    onClick(event) {
        let {menuClose, onClick, menuId} = this.props;
        !menuId && menuClose();
        onClick(event);
    }

    render() {
        const {menuId, labelKey, labelParams, t} = this.props;
        return (
            <MenuItem onClick={(event) => this.onClick(event)}>
                {t(labelKey, labelParams)}
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
