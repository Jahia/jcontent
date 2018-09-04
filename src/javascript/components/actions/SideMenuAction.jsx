import React from "react";
import Actions from "../Actions";
import {List, Collapse} from '@material-ui/core';
import {ArrowForward} from '@material-ui/icons';
import {compose} from "react-apollo";
import {translate} from "react-i18next";
import CmLeftMenuItem from "../renderAction/CmLeftMenuItem";

class SideMenuAction extends React.Component {
    state = {open: false};

    handleClick = () => {
        this.setState(state => ({open: !state.open}));
    };

    render() {
        const {menuId, children, context, ...rest} = this.props;
        return (<React.Fragment>
                {children({...rest, onClick: this.handleClick, open: this.state.open})}
                <Collapse in={this.state.open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <Actions menuId={menuId} context={context}>
                            {(props) =>
                                <CmLeftMenuItem {...props} icon={<ArrowForward/>}/>
                            }
                        </Actions>
                    </List>
                </Collapse>
            </React.Fragment>
        )
    };
}

SideMenuAction = compose(
    translate(),
)(SideMenuAction);


export default SideMenuAction;