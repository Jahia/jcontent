import {List, ListItem, withStyles} from "@material-ui/core";
import Actions from "./Actions";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";
import {lodash as _} from "lodash";
import {translate} from "react-i18next";

const styles = (theme) => ({
    triangle: {
        width: 0,
        height: 0,
        padding: 0,
        borderStyle: 'solid',
        borderWidth: '4px 0 4px 6.5px',
        borderColor: 'transparent transparent transparent #5c6164'
    },
    triangle_bottom: {
        width: 0,
        height: 0,
        borderStyle: 'solid',
        borderWidth: '6.5px 4px 0 4px',
        borderColor: '#5c6164 transparent transparent transparent'
    }
});

class CmLeftDrawerContent extends React.Component {

    render() {

        let {menuId, context, handleDrawerClose, actionPath, t, classes} = this.props;

        return <List style={{marginLeft: '18px', marginTop: '18px'}}>
            {console.log("CmLeftDrawerContent", menuId, _.includes(actionPath, menuId))}
            <Actions menuId={menuId} context={context} handleDrawerClose={handleDrawerClose} actionPath={actionPath}>
                {(menuConfig) =>
                    <ListItem selected={_.includes(actionPath, menuConfig.actionKey)} button onClick={(event) => menuConfig.onClick(event)}>
                        {menuConfig.hasChildren
                            ? <div className={ (menuConfig.open || menuConfig.selected) ? classes.triangle_bottom : classes.triangle}/>
                            : null
                        }
                        {console.log("CmLeftDrawerContent",  menuConfig.actionKey, _.includes(actionPath, menuConfig.actionKey))}
                        <FontAwesomeIcon icon={menuConfig.icon != null ? menuConfig.icon : ["far", "file"]}/>
                        &nbsp;
                        {t(menuConfig.labelKey, menuConfig.labelParams)}
                    </ListItem>
                }
            </Actions>
        </List>;
    }
}

CmLeftDrawerContent = _.flowRight(
    translate(),
    withStyles(styles)
)(CmLeftDrawerContent);

export default CmLeftDrawerContent;
