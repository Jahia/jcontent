import React from "react";
import {Toolbar, Typography} from '@material-ui/core';
import {translate} from 'react-i18next';
import {LanguageSwitcher, SearchBar} from '@jahia/react-material';
import SiteSelector from './SiteSelector';
import BurgerMenuButton from './BurgerMenuButton';
import {withStyles} from '@material-ui/core';


class CMTopBar extends React.Component {


    render() {
        return (
            <Toolbar color={'secondary'}>
                <BurgerMenuButton/>
                <div>
                    <SiteSelector/>
                    <h1>All Content</h1>
                    <LanguageSwitcher/>
                </div>
            </Toolbar>
        )
    }
}

export default translate()(CMTopBar);