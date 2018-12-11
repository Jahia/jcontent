import React, {Component} from 'react';
import {translate} from 'react-i18next';
import {Button, Menu, MenuItem, Tooltip, withStyles} from '@material-ui/core';
import {Share} from '@material-ui/icons';
import copy from 'copy-to-clipboard';
import {lodash as _} from 'lodash';
import {compose} from 'react-apollo';

const styles = theme => ({
    button: {
        margin: theme.spacing.unit
    },
    colorIcon: {
        color: '#303030'
    }
});

class ShareMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            shareMenuAnchor: null
        };
    }

    copy(value) {
        this.handleMenuClose('shareMenuAnchor');
        copy(value);
    }

    render() {
        const {t, selection, classes} = this.props;
        const {shareMenuAnchor} = this.state;

        if (_.isEmpty(selection)) {
            return null;
        }

        return (
            <span>
                <Tooltip title={t('label.contentManager.contentPreview.share')}>
                    <Button aria-owns={shareMenuAnchor ? 'share-menu' : null}
                            aria-haspopup="true"
                            className={classes.colorIcon}
                            onClick={event => this.handleMenuClick(event, 'shareMenuAnchor')}
                    >
                        <Share/>
                    </Button>
                </Tooltip>
                <Menu id="share-menu"
                      anchorEl={shareMenuAnchor}
                      open={Boolean(shareMenuAnchor)}
                      onClose={() => this.handleMenuClose('shareMenuAnchor')}
                >
                    <MenuItem onClick={() => this.copy(selection.path)}>
                        {t('label.contentManager.contentPreview.copyPathToClipboard')}
                    </MenuItem>
                    <MenuItem onClick={() => this.copy(selection.uuid)}>
                        {t('label.contentManager.contentPreview.copyUUIDToClipboard')}
                    </MenuItem>
                </Menu>
            </span>
        );
    }

    handleMenuClick(event, anchorType) {
        this.setState({[anchorType]: event.currentTarget});
    }

    handleMenuClose(anchorType) {
        this.setState({[anchorType]: null});
    }
}

export default compose(
    translate(),
    withStyles(styles),
)(ShareMenu);
