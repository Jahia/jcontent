import React from 'react';
import {Button, Menu, MenuItem, Typography} from '@material-ui/core';
import {ChevronDown} from 'mdi-material-ui';
import {lodash as _} from 'lodash';

class SiteSwitcherDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null
        };
        this.handleClick = this.handleClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    handleClick(event) {
        this.setState({anchorEl: event.currentTarget});
    }

    handleClose() {
        this.setState({anchorEl: null});
    }

    render() {
        let {siteKey, siteNodes, loading, onSelectSite, currentLang} = this.props;
        let {anchorEl} = this.state;

        if (loading) {
            return <span>Loading...</span>;
        }
        const siteNode = _.find(siteNodes, siteNode => siteNode.name === siteKey);
        return (
            <React.Fragment>
                <Button aria-owns={anchorEl ? 'site-switcher' : null}
                        color="inherit"
                        aria-haspopup="true"
                        data-cm-role="site-switcher"
                        onClick={this.handleClick}
                >
                    <Typography noWrap variant="body1" color="inherit">
                        {siteNode.displayName}
                    </Typography>
                    &nbsp;
                    <ChevronDown fontSize="small" color="inherit"/>
                </Button>
                <Menu id="site-switcher" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.handleClose}>
                    {siteNodes.map(siteNode => {
                        return (
                            <MenuItem
                                key={siteNode.uuid}
                                onClick={() => {
                                    onSelectSite(siteNode, currentLang);
                                    this.handleClose();
                                }}
                            >
                                {siteNode.displayName}
                            </MenuItem>
                        );
                    })}
                </Menu>
            </React.Fragment>
        );
    }
}

export default SiteSwitcherDisplay;
