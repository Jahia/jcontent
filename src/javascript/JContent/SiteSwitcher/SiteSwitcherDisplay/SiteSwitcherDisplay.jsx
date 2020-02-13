import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {Menu, MenuItem, withStyles} from '@material-ui/core';
import {Button, Typography} from '@jahia/design-system-kit';
import {ChevronDown} from 'mdi-material-ui';
import {lodash as _} from 'lodash';
import {compose} from '~/utils';

const styles = () => ({
    siteSwitcher: {
        marginRight: '8px!important'
    }
});

export const SiteSwitcherDisplay = ({siteKey, siteNodes, onSelectSite, classes}) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

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
                                onSelectSite(siteNode);
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

SiteSwitcherDisplay.propTypes = {
    classes: PropTypes.object.isRequired,
    onSelectSite: PropTypes.func.isRequired,
    siteKey: PropTypes.string.isRequired,
    siteNodes: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default compose(
    withStyles(styles)
)(SiteSwitcherDisplay);

