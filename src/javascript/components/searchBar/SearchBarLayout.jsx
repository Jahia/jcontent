import React from 'react';
import {Paper, Grid, Tooltip, IconButton, Typography} from '@material-ui/core';
import {Search} from '@material-ui/icons';

class SearchBarLayout extends React.Component {
    render() {
        let {children, leftFooter, rightFooter, onSearch, t} = this.props;

        return (
            <React.Fragment>
                <Paper square>
                    <Grid container wrap="nowrap" alignItems="center">
                        {children}
                        <Tooltip title={t('label.contentManager.search.search')}>
                            <IconButton color="primary" data-cm-role="search-submit" onClick={onSearch}>
                                <Search/>
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Paper>
                <Grid container spacing={0}>
                    <Grid item xs={8}>
                        <Typography align="left">
                            {leftFooter}
                        </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography align="right">
                            {rightFooter}
                        </Typography>
                    </Grid>
                </Grid>
            </React.Fragment>
        );
    }
}

export default SearchBarLayout;
