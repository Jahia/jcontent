import React from 'react';
import PropTypes from 'prop-types';
import {Paper, Tooltip, withStyles} from '@material-ui/core';
import {Button, Typography} from '@jahia/ds-mui-theme';
import {Search} from '@material-ui/icons';

const styles = () => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        width: '100%'
    },
    searchInput: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap'
    },
    searchBottom: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    button: {
        height: 44
    }
});

export const SearchBarLayout = ({children, leftFooter, rightFooter, onSearch, t, classes}) => (
    <div className={classes.root}>
        <div className={classes.searchInput}>
            {children}
            <Tooltip title={t('label.contentManager.search.search')}>
                <Paper>
                    <Button variant="ghost"
                            size="compact"
                            icon={<Search/>}
                            data-cm-role="search-submit"
                            classes={{root: classes.button}}
                            onClick={onSearch}
                    />
                </Paper>
            </Tooltip>
        </div>
        <div className={classes.searchBottom}>
            <div>
                <Typography align="left">
                    {leftFooter}
                </Typography>
            </div>
            <div>
                {rightFooter}
            </div>
        </div>
    </div>
);

SearchBarLayout.propTypes = {
    children: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    leftFooter: PropTypes.element,
    onSearch: PropTypes.func.isRequired,
    rightFooter: PropTypes.element,
    t: PropTypes.func.isRequired
};

SearchBarLayout.defaultProps = {
    leftFooter: null,
    rightFooter: null
};

export default withStyles(styles)(SearchBarLayout);
