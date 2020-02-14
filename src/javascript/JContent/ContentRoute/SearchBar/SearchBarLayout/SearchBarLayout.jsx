import React from 'react';
import PropTypes from 'prop-types';
import {Paper, Tooltip, withStyles} from '@material-ui/core';
import {Button} from '@jahia/design-system-kit';
import {Search} from '@material-ui/icons';

const styles = () => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end'
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
            <Tooltip title={t('jcontent:label.contentManager.search.search')}>
                <Paper elevation={6}>
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
                {leftFooter}
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
