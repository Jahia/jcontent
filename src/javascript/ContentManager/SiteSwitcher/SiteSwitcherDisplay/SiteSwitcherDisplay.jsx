import React from 'react';
import {Button, Menu, MenuItem, withStyles} from '@material-ui/core';
import {Typography} from '@jahia/ds-mui-theme';
import {ChevronDown} from 'mdi-material-ui';
import {lodash as _} from 'lodash';
import {compose} from 'react-apollo';

const styles = () => ({
    siteSwitcher: {
        marginRight: '8px!important'
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
        let {siteKey, siteNodes, loading, onSelectSite, classes, currentLang} = this.props;
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
                        className={classes.siteSwitcher}
                        onClick={this.handleClick}
                >
                    <Typography noWrap variant="zeta" color="inherit">
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
export default compose(
    withStyles(styles),
)(SiteSwitcherDisplay);
