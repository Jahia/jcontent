import React from "react";
import CmLeftDrawerContent from "../CmLeftDrawerContent";

const styles = (theme) => {

}

class SideMenuAction extends React.Component {

    componentWillUnmount() {
        const {openDrawerMenuId, menuId, handleDrawerClose} = this.props;
        // Close menu if one of the side menu is removed
        openDrawerMenuId === menuId && handleDrawerClose();
    }

    render() {
        const {t, menuId, children, labelKey, context, handleDrawer, handleDrawerClose, ...rest} = this.props;
        const actionContent = <CmLeftDrawerContent menuId={menuId} context={context} handleDrawerClose={handleDrawerClose}/>
        return (handleDrawer && <React.Fragment>
                {children({...rest, labelKey, onClick: handleDrawer.bind(this, {content: actionContent, title: labelKey}, menuId)})}
            </React.Fragment>
        )
    };
}


export default SideMenuAction;