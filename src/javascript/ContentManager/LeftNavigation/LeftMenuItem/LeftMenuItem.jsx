import React from 'react';
import {Badge, Button, Typography, withStyles} from '@material-ui/core';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';
import {toIconComponent} from '@jahia/react-material';

const styles = theme => ({
    nested: {
        paddingLeft: theme.spacing.unit * 4
    },
    badgeRoot: {
        display: 'block'
    },
    badgeBadge: {
        right: 0,
        top: '-8px'
    },
    listItem: {
        margin: 0,
        height: '64px',
        display: 'block',
        width: '60px!important',
        paddingBottom: '10px!important'
    },
    typographyIconLight: {
        color: theme.palette.text.contrastText,
        fontSize: '9px',
        textTransform: 'uppercase',
        transition: 'all 0.2s ease-in 0s'
    },
    typographyIcon: {
        color: theme.palette.text.secondary,
        fontSize: '9px',
        textTransform: 'uppercase',
        transition: 'all 0.2s ease-in 0s'
    },
    colorClosed: {
        fill: theme.palette.text.contrastText,
        '& [fill="backgroundColor"]': {
            fill: theme.palette.layout.dark
        }
    },
    colorOpen: {
        fill: theme.palette.text.secondary,
        '& [fill="backgroundColor"]': {
            fill: theme.palette.background.paper
        }
    }
});

export class LeftMenuItem extends React.Component {
    render() {
        const {classes, t, drawer, context} = this.props;
        const {onClick, buttonLabel, buttonIcon, badge} = context;

        let icon = toIconComponent(buttonIcon, drawer ? {classes: {root: classes.colorOpen}} : {classes: {root: classes.colorClosed}});

        let Content = (
            <React.Fragment>
                {Boolean(icon) && icon}
                <Typography className={drawer ? classes.typographyIcon : classes.typographyIconLight} data-cm-role="left-menu-item-text">
                    {t(buttonLabel)}
                </Typography>
            </React.Fragment>
        );

        return (
            <Button className={classes.listItem} onClick={e => onClick(context, e)}>
                {badge ?
                    <Badge badgeContent={badge} color="error" classes={{root: classes.badgeRoot, badge: classes.badgeBadge}} data-cm-role="workflow-active-task-count">
                        {Content}
                    </Badge> :
                    Content
                }
            </Button>
        );
    }
}

export default compose(
    translate(),
    withStyles(styles, {withTheme: true})
)(LeftMenuItem);

