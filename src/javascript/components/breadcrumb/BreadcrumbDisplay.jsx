import React from 'react';
import {Button, Menu, MenuItem} from '@material-ui/core';
import {Folder} from '@material-ui/icons';
import {PageIcon} from '@jahia/icons';
import {withStyles} from '@material-ui/core';
import {translate} from 'react-i18next';
import * as icons from '@jahia/icons';
import {ellipsizeText} from '../utils.js';
import {compose} from 'react-apollo';

const styles = theme => ({
    menuItem: {
        backgroundColor: theme.palette.background.paper
    },
    contentIcon: {
        fontSize: '20px'
    },
    contentLabel: {
        paddingLeft: theme.spacing.unit * 2,
        paddingRight: theme.spacing.unit * 2,
        color: theme.palette.layout.dark,
        marginRight: '-3px'
    },
    divider: {
        background: theme.palette.background.default,
        lineHeight: '1px',
        height: '1px'
    }
});

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
        };
    }

    static getDerivedStateFromProps(nextProps) {
        let {node} = nextProps;
        let anchorEl = document.getElementById('menuToggleButton_' + node.uuid);
        if (anchorEl) {
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
        let position = document.getElementById('menuToggleButton_' + node.uuid).getBoundingClientRect();
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
            let backdropEl = document.getElementById('breadcrumbMenu_' + node.uuid).children[0];
            backdropEl.addEventListener('mouseover', this.onMenuExit);
        }, 10);
    }

    onMenuExit() {
        setTimeout(() => {
            this.setState(() => ({
                menuActive: false
            }));
        }, 100);
    }

    onMenuButtonActivatorEnter() {
        if (!this.state.menuActive) {
            this.setState({menuActive: true});
        }
    }

    onMenuItemSelected(event, node) {
        this.props.handleSelect(node.mode, node.path);
        this.onMenuExit(event);
    }

    generateMenu(node) {
        let {classes} = this.props;
        return (
            <span>
                <MenuItem key={'dropdown_' + node.uuid}
                          disableRipple
                          selected
                          disableGutters
                          onClick={event => this.onMenuItemSelected(event, node)}
                >
                    {this.renderIcon(node, classes)}{node.name}
                </MenuItem>
                {node.siblings.map(siblingNode => {
                    if (siblingNode.name === node.name) {
                        return null;
                    }
                    return (
                        <MenuItem key={siblingNode.uuid} disableRipple classes={{root: classes.menuItem}} onClick={event => this.onMenuItemSelected(event, siblingNode)}>
                            {this.renderIcon(siblingNode, classes)}{siblingNode.name}
                        </MenuItem>

                    );
                })}
            </span>
        );
    }

    generateMenuButton(node, maxLabelLength, trimLabel) {
        let {classes} = this.props;
        if (node.siblings.length > 1) {
            return (
                <Button ref={this.anchorButton}
                        disableRipple
                        aria-haspopup="true"
                        aria-owns={'breadcrumbMenu_' + node.uuid}
                        id={'menuToggleButton_' + node.uuid}
                        onMouseOver={this.onMenuButtonActivatorEnter}
                >
                    {this.renderIcon(node, classes)}
                    {!trimLabel &&
                    <span className={classes.contentLabel} data-cm-role="breadcrumb-name">
                        {ellipsizeText(node.name, maxLabelLength)}
                    </span>
                    }
                </Button>
            );
        }
        return (
            <Button ref={this.anchorButton}
                    disableRipple
                    aria-haspopup="true"
                    aria-owns={'breadcrumbMenu_' + node.uuid}
                    id={'menuToggleButton_' + node.uuid}
                    onClick={() => {
                        this.props.handleSelect(node.siblings[0].mode, node.siblings[0].path);
                    }}
                    onMouseOver={this.onMenuButtonActivatorEnter}
            >
                {this.renderIcon(node, classes)}
                {!trimLabel &&
                <span className={classes.contentLabel} data-cm-role="breadcrumb-name">
                    {ellipsizeText(node.name, maxLabelLength)}
                </span>
                }
            </Button>
        );
    }

    renderIcon(node, classes) {
        switch (node.type) {
            case 'jnt:virtualsite':
                return <icons.VirtualsiteIcon className={classes.contentIcon}/>;
            case 'jnt:folder':
            case 'jnt:contentFolder':
                return <Folder className={classes.contentIcon}/>;
            case 'jnt:page':
            default:
                return <PageIcon className={classes.contentIcon}/>;
        }
    }

    render() {
        let {menuActive, anchorPosition} = this.state;
        let {node, maxLabelLength, trimLabel} = this.props;
        return (
            <span ref={this.menu} id={'breadcrumbSpan_' + node.uuid}>
                {this.generateMenuButton(node, maxLabelLength, trimLabel)}
                <Menu key={node.uuid}
                      disableAutoFocusItem
                      anchorPosition={anchorPosition}
                      anchorReference="anchorPosition"
                      container={this.menu.current}
                      id={'breadcrumbMenu_' + node.uuid}
                      open={menuActive}
                      onEnter={this.addMenuExitListener}
                >
                    {this.generateMenu(node)}
                </Menu>
            </span>
        );
    }
}

export default compose(translate(), withStyles(styles))(BreadcrumbDisplay);
