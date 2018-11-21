import React from 'react';
import {withStyles, Paper, Grid, Tooltip, Button, Typography} from '@material-ui/core';
import {Search} from '@material-ui/icons';

const styles = () => ({
    iconSize: {
        fontSize: '20px'
    },
    searchSize: {
        height: '34px',
        maxHeight: '34px',
        minHeight: '34px',
        flexGrow: 10,
        boxShadow: 'none!important'
    }
});

class SearchBarLayout extends React.Component {
    render() {
        let {children, leftFooter, rightFooter, onSearch, classes, t} = this.props;

        return (
            <React.Fragment>
                <Paper square className={classes.searchSize}>
                    <Grid container wrap="nowrap" className={classes.searchSize}>
                        {children}
                        <Tooltip title={t('label.contentManager.search.search')}>
                            <Button color="primary" data-cm-role="search-submit" onClick={onSearch}>
                                <Search className={classes.iconSize}/>
                            </Button>
                        </Tooltip>
                    </Grid>
                </Paper>
                <Grid container>
                    <Grid item xs={8}>
                        <Typography gutterBottom color="inherit" align="left">
                            {leftFooter}
                        </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography gutterBottom color="inherit" align="right">
                            {rightFooter}
                        </Typography>
                    </Grid>
                </Grid>
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(SearchBarLayout);
