import React from "react";
import Actions from "../Actions";
import {List, ListItem, withStyles} from '@material-ui/core';
import {lodash as _} from "lodash";
import {translate} from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const styles = (theme) => {

}

class SideMenuAction extends React.Component {

    render() {
        const {t, menuId, children, labelKey, context, handleDrawer, handleDrawerClose, classes, ...rest} = this.props;
        const actionContent = <List style={{marginLeft: '18px', marginTop: '18px'}}>
            <Actions menuId={menuId} context={context} handleDrawerClose={handleDrawerClose}>
                {(menuConfig) =>
                    <ListItem button onClick={(event) => menuConfig.onClick(event)}>
                    <FontAwesomeIcon icon={menuConfig.icon != null ? menuConfig.icon : ["far","file"]}/>&nbsp;{t(menuConfig.labelKey, menuConfig.labelParams)}
                    </ListItem>
                }
            </Actions>
        </List>
        return (handleDrawer && <React.Fragment>
                {children({...rest, labelKey, onClick: handleDrawer.bind(this, {content: actionContent, title: labelKey})})}
            </React.Fragment>
        )
    };
}

SideMenuAction = _.flowRight(
    translate(),
    withStyles(styles),
)(SideMenuAction);


export default SideMenuAction;