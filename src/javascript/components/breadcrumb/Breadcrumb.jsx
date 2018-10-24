import React from "react";
import PropTypes from "prop-types";
import {Button, Menu, MenuItem, Divider} from "@material-ui/core";
import styled from "styled-components/dist/styled-components";
import {ChevronRight as ChevronRightIcon, MoreHoriz, Folder, ArrowDropDown} from '@material-ui/icons';
import {PageIcon} from '@jahia/icons';
import {withStyles} from '@material-ui/core';
import {translate} from "react-i18next";
import Constants from '../constants';
import * as icons from '@jahia/icons';
import {ellipsizeText} from "../utils.js";

const styles = theme => ({
    root: {
        color: theme.palette.text.primary,
    },
    menuItemHeader: {
        width: '100%',
        display: "inline-block",
        backgroundColor: "#e3e1e1",
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
        fontSize: "18px",
    },
    contentIcon2: {
        fontSize: "20px",
    },
    contentLabel: {
        color: theme.palette.text.primary,
        marginLeft: '1px',
        marginRight: '-3px',
        fontSize: '12px',
    },
    contentLabelMenu: {
        color: theme.palette.text.dark,
        marginLeft: '1px',
        marginRight: '-3px',
        fontSize: '12px',
    },
    betweenIcon: {
        verticalAlign: "middle",
        position: "relative",
    },
    menu: {
        background: 'red'
    },
    divider:{
        background: '#bdbdbd',
        lineHeight: '1px',
        height: '1px',
    },
    chevronSvg: {
        fontSize: '18px',
        color: theme.palette.text.primary,
        marginRight: '-5px',
    },
    menuItemSize: {
        paddingLeft: '10px !important',
    },
    colorMenu: {
        background: '#f5f5f5',
    }
});

const MenuItemContainer = styled.div`
    width:100%;
    background: #F5F5f5;
    outline: none;
`;

const MenuItemLabel = styled.div`
    bottom: 7px;
    display: inline;
    position: relative;
`;

const MAX_ITEMS_APPROPRIATE_FOR_UNCUT_DISPLAY = 4;
const MAX_UNCUT_ITEMS_ON_CUT_DISPLAY = 3;
const MAX_TOTAL_ITEMS_ON_CUT_DISPLAY = 6;
const MAX_FIRST_LABEL_LENGTH = 20;
const MAX_LABEL_LENGTH = 10;

class BreadcrumbDisplay extends React.Component {

    constructor(props) {

        super(props);

        this.addMenuExitListener = this.addMenuExitListener.bind(this);
        this.onMenuButtonActivatorEnter = this.onMenuButtonActivatorEnter.bind(this);
        this.onMenuExit = this.onMenuExit.bind(this);
        this.onMenuItemSelected = this.onMenuItemSelected.bind(this);

        this.menu = React.createRef();
        this.anchorButton = React.createRef();

        this.state = {
            menuActive: false,
            anchorPosition: {
                top: 5,
                left: 50
            }
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let {node} = nextProps;
        let anchorEl = document.getElementById("menuToggleButton_" + node.uuid);
        if (anchorEl != null) {
            let anchorElPosition = anchorEl.getBoundingClientRect();
            return {
                anchorPosition: {
                    top: anchorElPosition.top - 5,
                    left: anchorElPosition.left
                }
            };
        }
        return {};
    }

    componentDidMount() {
        let {node} = this.props;
        let position = document.getElementById("menuToggleButton_" + node.uuid).getBoundingClientRect();
        this.setState({
            anchorPosition: {
                top: position.top - 5,
                left: position.left
            }
        });
    }

    addMenuExitListener() {
        let {node} = this.props;
        setTimeout(() => {
            let backdropEl = document.getElementById("breadcrumbMenu_" + node.uuid).children[0];
            backdropEl.addEventListener("mouseover", this.onMenuExit);
        }, 10);

    }

    onMenuExit(event) {
        setTimeout(() => {
            this.setState((prevState, props) => ({
                menuActive: false,
            }));
        }, 100);
    }

    onMenuButtonActivatorEnter(event) {
        if (!this.state.menuActive) {
            this.setState({menuActive: true});
        }
    };

    onMenuItemSelected(event, node) {
        this.props.handleSelect(node.mode, node.path);
        this.onMenuExit(event);
    }

    generateMenu(node) {
        let {classes} = this.props;
        return <span>
            <MenuItemContainer key={"dropdown_" + node.uuid} >
                <MenuItem className={classes.menuItemHeader} classes={{root: classes.menuItemSize}} disableRipple={true} onClick={(event) => this.onMenuItemSelected(event, node)}>
                    {this.renderIcon(node, classes)}
                    <MenuItemLabel className={classes.contentLabelMenu}>
                        {node.name}
                    </MenuItemLabel>
                </MenuItem>
            </MenuItemContainer>
            {node.siblings.length > 1 &&
                <div className={classes.divider}/>
            }
            {node.siblings.map((siblingNode, i) => {
                if (siblingNode.name === node.name) {
                    return null;
                }
                return <MenuItemContainer key={siblingNode.uuid}>
                    <MenuItem className={classes.menuItem} classes={{root: classes.menuItemSize}} disableRipple={true} onClick={(event) => this.onMenuItemSelected(event, siblingNode)}>
                        {this.renderIcon(siblingNode, classes)}
                        <MenuItemLabel className={classes.contentLabelMenu}>
                            {siblingNode.name}
                        </MenuItemLabel>
                    </MenuItem>
                </MenuItemContainer>;
            })}
        </span>;
    }

    generateMenuButton(node, maxLabelLength, trimLabel) {
        let {classes} = this.props;
        if (node.siblings.length > 1) {
            return <Button
                id={"menuToggleButton_" + node.uuid}
                ref={this.anchorButton}
                className={classes.menuButton}
                disableRipple={true}
                aria-owns={"breadcrumbMenu_" + node.uuid}
                aria-haspopup="true"
                onMouseOver={this.onMenuButtonActivatorEnter}
            >
                {this.renderIcon(node, classes)}
                {!trimLabel &&
                    <span className={classes.contentLabel}>
                        {ellipsizeText(node.name, maxLabelLength)}
                    </span>
                }
            </Button>;
        } else {
            return <Button
                id={"menuToggleButton_" + node.uuid}
                ref={this.anchorButton}
                className={classes.menuButton}
                disableRipple={true}
                aria-owns={"breadcrumbMenu_" + node.uuid}
                aria-haspopup="true"
                onClick={() => {
                    this.props.handleSelect(node.siblings[0].mode, node.siblings[0].path);
                }}
                onMouseOver={this.onMenuButtonActivatorEnter}
            >
                {this.renderIcon(node, classes)}
                {!trimLabel &&
                    <span className={classes.contentLabel}>
                        {ellipsizeText(node.name, maxLabelLength)}
                    </span>
                }
            </Button>;
        }
    }

    renderIcon(node, classes) {
        switch (node.type) {
            case "jnt:virtualsite" :
                return <icons.VirtualsiteIcon className={classes.contentIcon2}/>;
            case "jnt:folder":
            case "jnt:contentFolder":
                return <Folder className={classes.contentIcon}/>;
            case "jnt:page" :
            default:
                return <PageIcon className={classes.contentIcon}/>;
        }
    }

    render() {
        let {menuActive, anchorPosition} = this.state;
        let {node, maxLabelLength, trimLabel} = this.props;
        return <span ref={this.menu} id={"breadcrumbSpan_" + node.uuid}>
            {this.generateMenuButton(node, maxLabelLength, trimLabel)}
            <Menu
                disableAutoFocusItem={true}
                container={this.menu.current}
                anchorPosition={anchorPosition}
                key={node.uuid}
                id={"breadcrumbMenu_" + node.uuid}
                anchorReference={"anchorPosition"}
                open={menuActive}
                onEnter={this.addMenuExitListener}
            >
                {this.generateMenu(node)}
            </Menu>
        </span>;
    }
}

BreadcrumbDisplay = translate()(withStyles(styles)(BreadcrumbDisplay));

class Breadcrumb extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            breadcrumbs: []
        }
    }

    componentDidMount() {
        this.setState({
            breadcrumbs: Breadcrumb.parseEntries(this.props)
        });
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            breadcrumbs: Breadcrumb.parseEntries(nextProps)
        };
    }

    render() {

        let {classes, mode} = this.props;
        let {breadcrumbs} = this.state;

        if (_.isEmpty(breadcrumbs)) {
            return null;
        }

        // There is an issue likely originating from the Picker component that the first element of the array is empty when browsing files or content folders.
        // Remove that first element if so.
        if (breadcrumbs[0] == null) {
            breadcrumbs = _.tail(breadcrumbs);
        }

        let firstVisibleIndex = 1;
        if (breadcrumbs.length > MAX_TOTAL_ITEMS_ON_CUT_DISPLAY) {
            firstVisibleIndex += (breadcrumbs.length - MAX_TOTAL_ITEMS_ON_CUT_DISPLAY);
        }

        return <div>

            {/* The very first element is always visible. */}
            {this.generateBreadcrumbItem(breadcrumbs, 0, MAX_FIRST_LABEL_LENGTH)}

            {/* Render an ellipsis in case we are about to cut any intermediate breadcrumb items. */}
            {firstVisibleIndex > 1 &&
                <MoreHoriz className={classes.betweenIcon}/>
            }

            {breadcrumbs.map((breadcrumb, i) => {
                if (i < firstVisibleIndex) {
                    return null;
                }
                return this.generateBreadcrumbItem(breadcrumbs, i, MAX_LABEL_LENGTH);
            })}
        </div>;
    }

    generateBreadcrumbItem(items, itemIndex, maxLabelLength) {
        let {handleSelect, classes} = this.props;
        let item = items[itemIndex];
        return <span key={item.uuid}>
            <BreadcrumbDisplay
                id={item.uuid}
                handleSelect={handleSelect}
                node={item}
                maxLabelLength={maxLabelLength}
                trimLabel={(items.length > MAX_ITEMS_APPROPRIATE_FOR_UNCUT_DISPLAY) && (itemIndex < items.length - MAX_UNCUT_ITEMS_ON_CUT_DISPLAY)}
            />
            {itemIndex < items.length - 1 &&
                <ChevronRightIcon classes={{root: classes.chevronSvg}} className={classes.betweenIcon}/>
            }
        </span>;
    }

    static splitPath(path, type) {
        switch (type) {
            case 'contents':
            case 'files': {
                let [, , ...pathElements] = path.split('/');
                return pathElements;
            }
            case 'pages': {
                let [, ...pathElements] = path.split('/');
                return pathElements;
            }
        }
    }

    static parseTypeFromPath(rootPath, path) {
        if (path.indexOf(rootPath + "/contents") !== -1) {
            return "contents";
        } else if (path.indexOf(rootPath + "/files") !== -1) {
            return "files";
        }
        return "files";
    }

    static parseEntries(props) {

        let {pickerEntries: entries, path: selectedPath, rootLabel, t, rootPath, mode} = props;

        //Process these nodes
        let breadcrumbs = [];
        let rootType = this.parseTypeFromPath(rootPath, selectedPath);
        let selectedPathParts = this.splitPath(selectedPath, rootType);

        for (let i in entries) {

            let entry = entries[i];
            let entryPathParts = this.splitPath(entry.path, rootType);

            if (entryPathParts.length > selectedPathParts.length) {
                //skip, our selections does not go this deep.
                continue;
            }

            //Verify this is the same path along the tree that is currently selected.
            //We are checking parent of current entry
            let parentIndex = entryPathParts.length - 2;
            if (entryPathParts[parentIndex] !== undefined && selectedPathParts[parentIndex] !== entryPathParts[parentIndex]) {
                //This is a different path, we will skip it as it is not part of our current breadcrumb!
                continue;
            }

            let breadcrumb = breadcrumbs[entryPathParts.length - 1];

            if (breadcrumb === undefined) {
                //Start new object, we are at a deeper level then before.
                breadcrumb = {};
                breadcrumb.name = breadcrumbs.length === 0 ? rootLabel : entry.node.displayName;
                breadcrumb.uuid = entry.node.uuid;
                breadcrumb.path = entry.node.path;
                breadcrumb.type = entry.node.primaryNodeType.name;
                breadcrumb.pathType = rootType;
                breadcrumb.siblings = [];
            }

            //Add sibling to list (including first entry)
            let sibling = {
                uuid: entry.node.uuid,
                name: breadcrumbs.length === 0 ? rootLabel : entry.node.displayName,
                path: entry.path,
                pathType: breadcrumb.pathType,
                type: entry.node.primaryNodeType.name
            };

            //handle root siblings
            if (i == 0) {
                //@TODO update using gql query to retrieve root nodes when component is loaded
                const siblingsToBeAdded = [];
                if (mode === Constants.mode.FILES) {
                    siblingsToBeAdded.push({
                        uuid: "files_id",
                        name: t("label.contentManager.browseFiles"),
                        path: rootPath + "/files",
                        mode: "browse-files",
                        pathType: "files",
                        type: "jnt:folder"
                    });
                } else {
                    siblingsToBeAdded.push({
                        uuid: 'contents_id',
                        name: t("label.contentManager.browseFolders"),
                        mode: "browse",
                        path: rootPath + "/contents",
                        pathType: "contents",
                        type: "jnt:contentFolder"
                    });
                    siblingsToBeAdded.push({
                        uuid: "pages_id",
                        name: t("label.contentManager.browsePages"),
                        path: rootPath,
                        mode: "browse",
                        pathType: "pages",
                        type: "jnt:virtualsite"
                    });
                }
                for (let j in siblingsToBeAdded) {
                    breadcrumb.siblings.push(siblingsToBeAdded[j].type !== breadcrumb.type ? siblingsToBeAdded[j] : sibling);
                }
            } else {
                breadcrumb.siblings.push(sibling);
            }

            //If this path is the selected path, then update root breadcrumb with this entries information.
            if (selectedPathParts.slice(0, entryPathParts.length).join("/") === entryPathParts.join("/")) {
                breadcrumb.name = breadcrumbs.length === 0 ? rootLabel : entry.node.displayName;
                breadcrumb.uuid = entry.node.uuid;
                breadcrumb.path = entry.node.path;
                breadcrumb.type = entry.node.primaryNodeType.name;
            }

            breadcrumbs[entryPathParts.length - 1] = breadcrumb;
        }

        return breadcrumbs;
    }
}

Breadcrumb.propTypes = {
    path: PropTypes.string.isRequired,
    handleSelect: PropTypes.func.isRequired,
    rootLabel: PropTypes.string,
    rootPath: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired
};

export default translate()(withStyles(styles)(Breadcrumb));