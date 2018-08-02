import React from "react";
import PropTypes from "prop-types";
import * as _ from 'lodash';
import {Button, Menu, MenuItem} from '@material-ui/core';
import CmRouter from "../CmRouter";

class SiteSwitcher extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {dxContext} = this.props;
        return <CmRouter render={({path, params, goto}) => {
            return <SiteSwitcherDisplay dxContext={dxContext}/>
        }}/>
    }
}

export default SiteSwitcher;

class SiteSwitcherDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null
        }
    }

    handleClick = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleClose = () => {
        this.setState({ anchorEl: null });
    };

    render() {
        let {dxContext} = this.props;
        let {anchorEl} = this.state;
        return <div>
            <Button aria-owns={anchorEl ? 'site-menu' : null}
                    aria-haspopup="true"
                    onClick={this.handleClick}>{dxContext.siteName}</Button>
            <Menu id="site-switcher"
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={this.handleClose}>
                <MenuItem onClick={this.handleClose}>{dxContext.siteName}</MenuItem>
            </Menu>
        </div>
    }
}

