import React from 'react';
import {withStyles} from '@material-ui/core';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';
import {Button, Typography} from '@material-ui/core';
import {toIconComponent} from '@jahia/react-material';

const styles = theme => ({
    nested: {
        paddingLeft: theme.spacing.unit * 4
    },
    listItem: {
        display: 'block',
        padding: '0!important',
        width: '60px!important',
        paddingBottom: '10px!important'
    },
    typographyIconLight: {
        display: 'block',
        color: theme.palette.text.contrastText,
        fontSize: '9px',
        textAlign: 'center',
        textTransform: 'uppercase',
        fontWeight: 400,
        width: '100%',
        transition: 'all 0.2s ease-in 0s'
    },
    typographyIcon: {
        display: 'block',
        color: theme.palette.text.primary,
        fontSize: '9px',
        textAlign: 'center',
        textTransform: 'uppercase',
        fontWeight: 400,
        width: '100%',
        transition: 'all 0.2s ease-in 0s'
    },
    bottomListItem: {
        display: 'block',
        padding: '0!important',
        textAlign: 'center',
        position: 'absolute',
        bottom: '10px',
        width: '48px!important',
        marginLeft: 10,
        paddingBottom: '10px!important'
    },
    colorClosed: {
        fill: '#F5F5F5',
        '& [fill="backgroundColor"]': {
            fill: theme.palette.layout.dark
        }
    },
    colorOpen: {
        fill: '#504e4d',
        '& [fill="backgroundColor"]': {
            fill: theme.palette.background.paper
        }
    }
});

class CmLeftMenuItem extends React.Component {
    render() {
        const {classes, t, drawer, bottom, context} = this.props;
        const {onClick, buttonLabel, buttonIcon, badge} = context;

        let icon = toIconComponent(buttonIcon, drawer ? {classes: {root: classes.colorOpen}} : {classes: {root: classes.colorClosed}});

        return (
            <Button className={bottom ? classes.bottomListItem : classes.listItem} onClick={e => onClick(context, e)}>
                {Boolean(icon) && icon}
                {Boolean(badge) && badge}
                <Typography className={drawer ? classes.typographyIcon : classes.typographyIconLight}
                            data-cm-role="left-menu-item-text"
                >
                    {t(buttonLabel)}
                </Typography>
            </Button>
        );
    }
}

export default compose(
    translate(),
    withStyles(styles, {withTheme: true})
)(CmLeftMenuItem);

