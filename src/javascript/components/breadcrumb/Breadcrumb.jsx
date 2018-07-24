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
        this.props.handleSelect(path, type);
        this.onMenuItemLeave(event);
    }
    generateMenu(nodes) {
        let {classes} = this.props;
        if (nodes.siblings.length > 1) {
            return <span>
                <MenuItemContainer key={nodes.uuid} onMouseEnter={this.onMenuItemEnter}
                                   onMouseLeave={this.onMenuItemLeave}>
                    <ArrowDropDown className={classes.chevronIcon}/>
                    <MenuItem className={classes.menuItemHeader}
                              disableRipple={true}
                              onClick={(event) => {event.preventDefault()}}>
                        {nodes.name}
                    </MenuItem>
                </MenuItemContainer>
                {nodes.siblings.map((node, i) => {
                    return <MenuItemContainer key={node.uuid}>
                        <MenuItem className={classes.menuItem}
                                 onMouseEnter={this.onMenuItemEnter}
                                 onMouseLeave={this.onMenuItemLeave}
                                 onClick={(event) => this.onMenuItemSelected(event, node.path, "contents")}>
                            {this.renderIcon(node.type)}
                            <MenuItemLabel>{node.name}</MenuItemLabel>
                        </MenuItem>
                    </MenuItemContainer>
                })}
            </span>
        }
        return null;
    }

    generateMenuButton(nodes) {
        let {anchorEl} = this.state;
        let {classes} = this.props;
        if (nodes.siblings.length > 1) {
            return <Button
                id={"menuToggleButton_" + nodes.uuid}
                className={classes.menuButton}
                disableRipple={true}
                aria-owns={anchorEl ? "breadcrumbMenu_" + nodes.uuid : null}
                aria-haspopup="true"
                onMouseEnter={this.onMenuButtonActivatorEnter}
                onMouseLeave={this.onMenuButtonActivatorLeave}>
                {this.renderIcon(nodes.type)}
                {nodes.name}
            </Button>
        } else {
            return <Button
                id={"menuToggleButton_" + nodes.uuid}
                className={classes.menuButton}
                disableRipple={true}
                aria-owns={anchorEl ? "breadcrumbMenu_" + nodes.uuid : null}
                aria-haspopup="true"
                onMouseEnter={this.onMenuButtonActivatorEnter}
                onMouseLeave={this.onMenuButtonActivatorLeave}
                onClick={() => this.props.handleSelect(nodes.siblings[0].path, "contents")}>
                {this.renderIcon(nodes.type)}
                {nodes.name}
            </Button>
        }
    }

    renderIcon(type) {
        let {classes} = this.props;
        switch(type) {
            case "jnt:virtualsite" : return <VirtualsiteIcon className={classes.contentIcon}/>;
            case "jnt:page" : return <PageIcon className={classes.contentIcon}/>;
        }
    }

    render() {
        let {anchorEl, menuActive, menuItemActive} = this.state;
        let {nodes} = this.props;
        return (<span id={"breadcrumbSpan_" + nodes.uuid}>
            {this.generateMenuButton(nodes)}
            <Menu key={nodes.uuid} id={"breadcrumbMenu_" + nodes.uuid} anchorEl={anchorEl} open={menuActive || menuItemActive}>
                {this.generateMenu(nodes)}
            </Menu>
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
        let {path, link, pickerEntries} = this.props;
        let breadcrumbs = this.parseEntries(pickerEntries, path);

        return (<div>
            {breadcrumbs.map((breadcrumb, i) => {
               return <span key={breadcrumb.uuid}>
                    <StyledBreadcrumbDisplay handleSelect={this.props.handleSelect} id={breadcrumb.uuid} nodes={breadcrumb} path={path} link={link} />
                   {i < breadcrumbs.length-1 ? <ChevronRightIcon className={classes.chevronIcon}/> : null}
                   </span>
            })}
        </div>)
    }

    parseEntries(entries, selectedPath) {
        //Process these nodes
        let breadcrumbs = [];
        let selectedPathParts = selectedPath.replace("/sites/", "").split("/");
        for (let i in entries) {
            let entry =  entries[i];
            let entryPathParts = entry.path.replace("/sites/", "").split("/");
            if (entryPathParts > selectedPathParts) {
                //skip, our selections does not go this deep.
                continue;
            }
            //Verify this is the same path along the tree that is currently selected.
            //We are checking parent of current entry
            let parentIndex = entryPathParts.length -2;
            if (entryPathParts[parentIndex] !== undefined && selectedPathParts[parentIndex] !== entryPathParts[parentIndex]) {
                //This is a different path, we will skip it as it is not part of our current breadcrumb!
                continue;
            }
            let breadcrumb = breadcrumbs[entryPathParts.length-1];
            if (breadcrumb === undefined) {
                //Start new object, we are at a deeper level then before.
                breadcrumb = {};
                breadcrumb.name = entry.node.primaryNodeType.name === "jnt:virtualsite" ? "Browse Pages" : entry.name;
                breadcrumb.uuid = entry.node.uuid;
                breadcrumb.type = entry.node.primaryNodeType.name;
                breadcrumb.siblings = [];
            }
            //Add sibling to list (including first entry)
            let sibling = {
                uuid: entry.node.uuid,
                name: entry.name,
                path: entry.path,
                type: entry.node.primaryNodeType.name
            };
            breadcrumb.siblings.push(sibling);
            //If this path is the selected path, then update root breadcrumb with this entries information.
            if (selectedPathParts.slice(0, entryPathParts.length).join("/") === entryPathParts.join("/")) {
                breadcrumb.name = entry.node.primaryNodeType.name === "jnt:virtualsite" ? "Browse Pages" : entry.name;
                breadcrumb.uuid = entry.node.uuid;
                breadcrumb.type = entry.node.primaryNodeType.name;
            }
            breadcrumbs[entryPathParts.length-1] = breadcrumb;
        }
        return breadcrumbs;
    }
 }

Breadcrumb.propTypes = {
    path: PropTypes.string.isRequired,
    dxContext: PropTypes.object.isRequired,
    handleSelect: PropTypes.func.isRequired
};
export default withStyles(styles)(Breadcrumb);