import React from 'react';
import {compose} from 'react-apollo';
import {Button, Menu, MenuItem, Typography, withStyles} from '@material-ui/core';
import {ChevronDown} from 'mdi-material-ui';
import {lodash as _} from 'lodash';
import {translate} from 'react-i18next';

const styles = theme => ({
    typography: {
        color: theme.palette.text.contrastText
    },
    formControl: {
        minWidth: 120
    },
    iconLight: {
        color: theme.palette.background.paper,
        fontSize: '18px'
    },
    iconDark: {
        color: '#504e4d',
        fontSize: '18px'
    },
    input1: {
        backgroundColor: 'transparent',
        color: '#ffffff',
        boxShadow: 'none',
        fontSize: '0.875rem'
    }
});

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
        let {siteKey, siteNodes, loading, onSelectSite, classes, currentLang, dark} = this.props;
        let {anchorEl} = this.state;

        if (loading) {
            return <span>Loading...</span>;
        }
        const siteNode = _.find(siteNodes, siteNode => siteNode.name === siteKey);
        return (
            <React.Fragment>
                <Button aria-owns={anchorEl ? 'site-switcher' : null}
                        aria-haspopup="true"
                        data-cm-role="site-switcher"
                        onClick={this.handleClick}
                >
                    <Typography variant="body1" color="inherit" className={classes.typography}>
                        {siteNode.displayName}
                    </Typography>
                    &nbsp;
                    <ChevronDown className={dark ? classes.iconDark : classes.iconLight}/>
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

export default compose(
    translate(),
    withStyles(styles)
)(SiteSwitcherDisplay);
