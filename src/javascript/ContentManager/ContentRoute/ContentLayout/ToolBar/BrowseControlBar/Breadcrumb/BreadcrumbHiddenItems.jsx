import React, {useState} from 'react';
import PropTypes from 'prop-types';
import iconRenderer from './iconRenderer';
import {Menu, MenuItem, withStyles} from '@material-ui/core';
import {IconButton, Typography} from '@jahia/ds-mui-theme';
import {MoreHoriz} from '@material-ui/icons';

const styles = theme => ({
    contentLabel: {
        paddingLeft: theme.spacing.unit
    },
    menu: {
        verticalAlign: 'middle',
        color: theme.palette.text.disabled
    }
});

const BreadcrumbHiddenItems = ({hidden, selectItem, classes}) => {
    const [menuAnchor, setMenuAnchor] = useState();

    return (
        <React.Fragment>
            <IconButton icon={<MoreHoriz className={classes.menu} data-sel-role="hidden-items"/>}
                        onClick={e => setMenuAnchor(e.currentTarget)}/>
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                data-sel-role="hidden-menu"
                onClose={() => setMenuAnchor(null)}
            >
                {hidden.map(item => {
                    return (
                        <MenuItem
                            key={item.uuid}
                            disableRipple
                            onClick={() => selectItem(item.path)}
                        >
                            {iconRenderer(item)}
                            <Typography variant="iota"
                                        data-cm-role="breadcrumb-name"
                                        classes={{root: classes.contentLabel}}
                            >
                                {item.name}
                            </Typography>
                        </MenuItem>
                    );
                })}
            </Menu>
        </React.Fragment>
    );
};

BreadcrumbHiddenItems.propTypes = {
    classes: PropTypes.object.isRequired,
    selectItem: PropTypes.func.isRequired,
    hidden: PropTypes.array.isRequired
};

export default withStyles(styles)(BreadcrumbHiddenItems);
