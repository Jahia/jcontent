import React, {useState} from 'react';
import {Menu, MenuItem, withStyles} from '@material-ui/core';
import {Button, Typography} from '@jahia/ds-mui-theme';
import {ChevronDown} from 'mdi-material-ui';
import {lodash as _} from 'lodash';
import {compose} from 'react-apollo';

const styles = () => ({
    siteSwitcher: {
        marginRight: '8px!important'
    }
});

export const SiteSwitcherDisplay = ({siteKey, siteNodes, loading, onSelectSite, classes, currentLang}) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    if (loading) {
        return <span>Loading...</span>;
    }
    const siteNode = _.find(siteNodes, siteNode => siteNode.name === siteKey);
    return (
        <React.Fragment>
            <Button aria-owns={anchorEl ? 'site-switcher' : null}
                    size="compact"
                    color="inverted"
                    aria-haspopup="true"
                    data-cm-role="site-switcher"
                    className={classes.siteSwitcher}
                    onClick={handleClick}
            >
                <Typography noWrap variant="zeta" color="inherit">
                    {siteNode.displayName}
                </Typography>
                &nbsp;
                <ChevronDown fontSize="small" color="inherit"/>
            </Button>
            <Menu id="site-switcher" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                {siteNodes.map(siteNode => {
                    return (
                        <MenuItem
                            key={siteNode.uuid}
                            onClick={() => {
                                onSelectSite(siteNode, currentLang);
                                handleClose();
                            }}
                        >
                            {siteNode.displayName}
                        </MenuItem>
                    );
                })}
            </Menu>
        </React.Fragment>
    );
};

export default compose(
    withStyles(styles),
)(SiteSwitcherDisplay);
