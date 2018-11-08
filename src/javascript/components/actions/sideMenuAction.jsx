import React from "react";
import CmLeftDrawerContent from "../leftMenu/CmLeftDrawerContent";

// class SideMenuAction extends React.Component {
//
//     componentWillUnmount() {
//         const {openDrawerMenuId, menuId, handleDrawerClose} = this.props;
//         // Close menu if one of the side menu is removed
//         openDrawerMenuId === menuId && handleDrawerClose();
//     }
//
//     render() {
//         const {t, menuId, children, labelKey, context, handleDrawer, handleDrawerClose, ...rest} = this.props;
//         return handleDrawer &&
//             <React.Fragment>
//                 {children({...rest, labelKey, onClick: handleDrawer.bind(this, {content: actionContent, title: labelKey}, menu)})}
//             </React.Fragment>;
//     };
// }


let sideMenuAction = {
    onClick: (context) => {
        if (context.drawerOpen) {
            context.handleDrawerClose()
        } else {
            context.handleDrawerOpen({content: <CmLeftDrawerContent context={context}/>, title: context.buttonLabel}, context.menu)
        }
    },

    onDestroy:(context) => {
        context.openDrawerMenu === context.menu && context.handleDrawerClose();
    }

}

export default sideMenuAction;