import React from "react";
import PropTypes from "prop-types";
import {Button, Menu, MenuItem} from "@material-ui/core";
import styled from "styled-components/dist/styled-components";
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import {VirtualsiteIcon, PageIcon} from '@jahia/icons';
import { withStyles } from '@material-ui/core/styles';
const styles = theme => ({
    root: {
        color: theme.palette.text.primary,
    },
    menuItemHeader: {
        display: "inline-block",
        outline: "none"
    },
    menuItem: {
        width: "100%",
        display: "inline-block",
        '&:hover': {
            backgroundColor: "#e3e1e1 !important",
        },
    },
    menuButton: {
        '&:hover': {
            backgroundColor: "transparent !important",
        },
    },
    contentIcon: {
        paddingRight: "10px"
    },
    chevronIcon: {
        verticalAlign: "bottom",
        position: "relative",
        bottom: "6px"
    },
});

const MenuItemContainer = styled.div`
    width:100%;
    outline: none;
`;
const MenuItemLabel = styled.div`
    bottom: 7px;
    display: inline;
    position: relative;
    `;
class BreadcrumbDisplay extends React.Component {

    constructor(props) {
        super(props);
        this.onMenuButtonActivatorEnter = this.onMenuButtonActivatorEnter.bind(this);
        this.onMenuButtonActivatorLeave = this.onMenuButtonActivatorLeave.bind(this);
        this.onMenuItemEnter = this.onMenuItemEnter.bind(this);
        this.onMenuItemLeave = this.onMenuItemLeave.bind(this);
        this.onMenuItemSelected = this.onMenuItemSelected.bind(this);
        this.menuItemCloseTimeout = null;
        this.state = {
            menuItemActive: false,
            menuItemCloseTimeout: null,
            anchorEl: null
        }
    }

    onMenuItemEnter(event) {
        if (this.menuItemCloseTimeout !== null) {
            clearTimeout(this.menuItemCloseTimeout);
        }
        this.setState({
            menuItemActive: true,
            menuItemCloseTimeout: null
        });
    }
    onMenuItemLeave(event) {
        this.menuItemCloseTimeout = setTimeout(() => {
            this.setState((prevState, props) => ({
                anchorEl: null,
                menuItemActive: false,
                menuItemCloseTimeout: null
            }));
        }, 200);
    }
    onMenuButtonActivatorEnter(event) {
        this.setState({ anchorEl: event.currentTarget, menuActive: true});
    };
    onMenuButtonActivatorLeave(event) {
        this.setState({menuActive: false});
    };

    onMenuItemSelected(event, path, type) {
        let {updatePickerSelectedPath} = this.props;
        updatePickerSelectedPath(path, type);
        this.onMenuItemLeave(event);
    }
    generateMenu(nodes) {
        let {anchorEl, menuActive, menuItemActive} = this.state;
        let {classes} = this.props;
        if (nodes.siblings.length > 1) {
            return <Menu key={nodes.uuid} id={"breadcrumbMenu_" + nodes.uuid} anchorEl={anchorEl} open={menuActive || menuItemActive}>
                {nodes.siblings.map((node, i) => {
                    if (i === 0) {
                        return <MenuItemContainer key={node.uuid} onMouseEnter={this.onMenuItemEnter}
                                               onMouseLeave={this.onMenuItemLeave}>
                            <ArrowDropDown className={classes.chevronIcon}/>
                            <MenuItem className={classes.menuItemHeader}
                                      onClick={(event) => this.onMenuItemSelected(event, node.path, "contents")}>
                                {node.name}
                            </MenuItem>
                        </MenuItemContainer>
                    } else {
                        return <MenuItemContainer key={node.uuid}>
                            <MenuItem className={classes.menuItem}
                                     onMouseEnter={this.onMenuItemEnter}
                                     onMouseLeave={this.onMenuItemLeave}
                                     onClick={(event) => this.onMenuItemSelected(event, node.path, "contents")}>
                                {this.renderIcon(node.type)}
                                <MenuItemLabel>{node.name}</MenuItemLabel>
                            </MenuItem>
                        </MenuItemContainer>
                    }
                })}
            </Menu>
        }
        return null;
    }

    renderIcon(type) {
        let {classes} = this.props;
        switch(type) {
            case "jnt:virtualsite" : return <VirtualsiteIcon className={classes.contentIcon}/>;
            case "jnt:page" : return <PageIcon className={classes.contentIcon}/>;
        }
    }

    generateMenuButton(nodes) {
        let {anchorEl} = this.state;
        let {updatePickerSelectedPath, classes} = this.props;
        if (nodes.siblings.length > 1) {
            return <Button
                className={classes.menuButton}
                id={"menuToggleButton_" + nodes.uuid}
                aria-owns={anchorEl ? "breadcrumbMenu_" + nodes.uuid : null}
                aria-haspopup="true"
                onMouseEnter={this.onMenuButtonActivatorEnter}
                onMouseLeave={this.onMenuButtonActivatorLeave}>
                {this.renderIcon(nodes.type)}
                {nodes.name}
            </Button>
        } else {
            return <Button
                className={classes.menuButton}
                id={"menuToggleButton_" + nodes.uuid}
                aria-owns={anchorEl ? "breadcrumbMenu_" + nodes.uuid : null}
                aria-haspopup="true"
                onMouseEnter={this.onMenuButtonActivatorEnter}
                onMouseLeave={this.onMenuButtonActivatorLeave}
                onClick={() => updatePickerSelectedPath(nodes.siblings[0].path, "contents")}>
                {this.renderIcon(nodes.type)}
                {nodes.name}
            </Button>
        }
    }

    render() {
        let {nodes} = this.props;
        return (<span id={"breadcrumbSpan_" + nodes.uuid}>
            {this.generateMenuButton(nodes)}
            {this.generateMenu(nodes)}
        </span>)
    }
}

const StyledBreadcrumbDisplay = withStyles(styles)(BreadcrumbDisplay);

class Breadcrumb extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { classes } = this. props;
        let {path, link, params, pickerEntries, updatePickerSelectedPath} = this.props;
        let breadcrumbs = this.parseEntries(pickerEntries);

        return (<div>
            {breadcrumbs.map((breadcrumb, i) => {
               return <span key={breadcrumb.uuid}>
                    <StyledBreadcrumbDisplay updatePickerSelectedPath={updatePickerSelectedPath} id={breadcrumb.uuid} nodes={breadcrumb} params={params} path={path} link={link} />
                   {i < breadcrumbs.length-1 ? <ChevronRightIcon className={classes.chevronIcon}/> : null}
                   </span>
            })}
        </div>)
    }

    parseEntries(entries) {
        //Process these nodes
        let breadcrumbs = [];
        let splitCount = -1;
        for (let i in entries) {
            let entry =  entries[i];
            let newSplitCount = entry.path.split("/").length;
            if (splitCount < newSplitCount) {
                //Start new object, we are at a deeper level then before.
                let breadcrumb = {};
                breadcrumb.name = entry.node.primaryNodeType.name === "jnt:virtualsite" ? "Browse Pages" : entry.name;
                breadcrumb.uuid = entry.node.uuid;
                breadcrumb.type = entry.node.primaryNodeType.name;
                breadcrumb.siblings = [];
                breadcrumbs.push(breadcrumb);
                splitCount = newSplitCount;
            }
            //Add sibling to list (including first entry)
            let breadcrumb = breadcrumbs.pop();
            let sibling = {
                uuid: entry.node.uuid,
                name: entry.name,
                path: entry.path,
                type: entry.node.primaryNodeType.name
            };
            breadcrumb.siblings.push(sibling);
            breadcrumbs.push(breadcrumb);
        }
        return breadcrumbs;
    }
 }

Breadcrumb.propTypes = {
    path: PropTypes.string.isRequired,
    params: PropTypes.object.isRequired,
    dxContext: PropTypes.object.isRequired,
    updatePickerSelectedPath: PropTypes.func.isRequired
};
export default withStyles(styles)(Breadcrumb);