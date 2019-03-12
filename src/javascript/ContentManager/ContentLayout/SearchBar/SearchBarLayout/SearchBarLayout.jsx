import PropTypes from 'prop-types';
import React from 'react';
import {Grid, Tooltip, Paper, withStyles} from '@material-ui/core';
import {Button, Typography} from '@jahia/ds-mui-theme';
import {Search} from '@material-ui/icons';

const styles = () => ({
    input: {
        height: 44
    }
});

export const SearchBarLayout = ({children, leftFooter, rightFooter, onSearch, t, classes}) => (
    <React.Fragment>
        <Grid container
              direction="column"
              justify="flex-end"
              alignItems="flex-end"
        >
            <Grid container
                  direction="row"
                  justify="flex-end"
                  alignItems="center"
            >
                {children}
                <Tooltip title={t('label.contentManager.search.search')}>
                    <Paper>
                        <Button variant="ghost"
                                size="compact"
                                icon={<Search/>}
                                data-cm-role="search-submit"
                                classes={{root: classes.input}}
                                onClick={onSearch}
                        />
                    </Paper>
                </Tooltip>
            </Grid>
            <Grid container
                  direction="row"
                  justify="flex-end"
                  alignItems="flex-end"
            >
                <Grid item xs={8}>
                    <Typography align="left">
                        {leftFooter}
                    </Typography>
                </Grid>
                <Grid item xs={4}>
                    {rightFooter}
                </Grid>
            </Grid>
        </Grid>
    </React.Fragment>
);

SearchBarLayout.propTypes = {
    children: PropTypes.element.isRequired,
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
