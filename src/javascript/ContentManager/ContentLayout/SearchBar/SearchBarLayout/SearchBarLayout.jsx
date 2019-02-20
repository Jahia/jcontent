import React from 'react';
import {Grid, IconButton, Tooltip, Typography, Paper} from '@material-ui/core';
import {Search} from '@material-ui/icons';

export class SearchBarLayout extends React.Component {
    render() {
        let {children, leftFooter, rightFooter, onSearch, t} = this.props;

        return (
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
                                <IconButton color="primary" data-cm-role="search-submit" onClick={onSearch}>
                                    <Search/>
                                </IconButton>
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
    }
}

export default SearchBarLayout;
