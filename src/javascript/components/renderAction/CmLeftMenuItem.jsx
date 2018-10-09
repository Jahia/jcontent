import React from 'react';
import {withStyles} from "@material-ui/core";
import {compose} from "react-apollo";
import {translate} from "react-i18next";
import {Button, Typography} from "@material-ui/core";

const styles = theme => ({
    nested: {
        paddingLeft: theme.spacing.unit * 4,
    },
    listItem: {
        display: 'block',
        padding: '0!important',
        width: '60px!important',
        paddingBottom: '10px!important',
    },
    typographyIconLight: {
        display: 'block',
        color: '#F5F5F5',
        fontSize: '0.472rem',
        textAlign: 'center',
        fontFamily: "Nunito sans, sans-serif",
        textTransform: 'uppercase',
        fontWeight: 400,
        width: '100%',
        transition: 'all 0.2s ease-in 0s'
    },
    typographyIcon: {
        display: 'block',
        color: '#504e4d',
        fontSize: '0.472rem',
        textAlign: 'center',
        fontFamily: "Nunito sans, sans-serif",
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
        paddingBottom: '10px!important',
    }
});

class CmLeftMenuItem extends React.Component {
    render() {
        const {classes, bottom, onClick, t, icon, drawer, labelKey, badge} = this.props;
        return (
            <Button className={bottom ? classes.bottomListItem : classes.listItem} onClick={onClick}>
                {icon}
                {badge}
                <Typography className={drawer ? classes.typographyIcon : classes.typographyIconLight} data-cm-role={'left-menu-item-text'}>
                    {t(labelKey)}
                </Typography>
            </Button>
        )
    }
}

CmLeftMenuItem = compose(
    translate(),
    withStyles(styles, {withTheme: true})
)(CmLeftMenuItem);

export default CmLeftMenuItem;

