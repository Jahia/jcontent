import React from 'react';
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {withApollo} from "react-apollo/index";
import {Menu} from "@material-ui/core";
import * as _ from "lodash";
import CmMenuItem from "../renderAction/CmMenuItem";
import Actions from "../Actions";
import {invokeContextualMenu} from "./redux/actions";


class ContextualMenu extends React.Component {

    constructor(props) {
        super(props);
    }

    closeContextMenu(event) {
        event.preventDefault();
        let clickEvent = new MouseEvent('click', {bubbles:true, cancelable: false});
        //Dispatch event to close backdrop
        event.target.dispatchEvent(clickEvent);
    }

    render() {
        let {contextualMenu, lang, onContextualMenu} = this.props;
             return contextualMenu.isOpen ? <Menu
                data-cm-role={'contextual-menu-action'}
                BackdropProps={{invisible:true, onContextMenu: (event) => this.closeContextMenu(event)}}
                anchorPosition={{top: contextualMenu.event.clientY, left: contextualMenu.event.clientX}}
                anchorReference={"anchorPosition"}
                open={contextualMenu.isOpen}
                onClose={() => {onContextualMenu({isOpen: false})}}>
                    <Actions menuId={contextualMenu.menuId} context={{
                        uuid: contextualMenu.uuid,
                        path: contextualMenu.path,
                        displayName: contextualMenu.displayName,
                        primaryNodeType: contextualMenu.primaryNodeType,
                        lang: lang,
                        nodeName: contextualMenu.nodeName
                    }}>{(props) => {
                        return <CmMenuItem {...props} menuClose={()=>{onContextualMenu({isOpen: false})}}/>
                    }}
                </Actions>
            </Menu>: null;
    }
}

const mapStateToProps = (state, ownProps) => ({
    contextualMenu: state.contextualMenu,
    lang: state.lang
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    onContextualMenu: (params) => dispatch(invokeContextualMenu(params))
});

ContextualMenu = _.flowRight(
    translate(),
    withApollo,
    connect(mapStateToProps, mapDispatchToProps)
)(ContextualMenu);

export default ContextualMenu;