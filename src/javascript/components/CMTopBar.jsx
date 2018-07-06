import React from "react";
import {withStyles, Toolbar, Typography} from '@material-ui/core';
import {translate} from 'react-i18next';
import {LanguageSwitcher, SearchBar} from '@jahia/react-material';
import SiteSelector from './SiteSelector';
import BurgerMenuButton from './BurgerMenuButton';
import {compose} from "react-apollo/index";

const styles = theme => ({
    title: {
        display: "inline-block",
        verticalAlign: "top"
    },
    root: {
        flexGrow: 1,
    }
});

class CMTopBar extends React.Component {

    render() {
        const { classes, t } = this.props;
        return (
            <div className={classes.root}>
                <Toolbar color={'secondary'}>
                    <BurgerMenuButton/>
                    <div className={classes.title}>
                        <SiteSelector/>
                        <Typography variant="display1" color="inherit">{t('label.contentManager.title')}</Typography>
                        <LanguageSwitcher/>
                    </div>
                    <SearchBar placeholderLabel={"search"} onChangeFilter={""} onFocus={""} onBlur={""}/>
                </Toolbar>
            </div>
        );
    }
}

CMTopBar = compose(
    translate(),
    withStyles(styles)
)(CMTopBar);

export default CMTopBar;