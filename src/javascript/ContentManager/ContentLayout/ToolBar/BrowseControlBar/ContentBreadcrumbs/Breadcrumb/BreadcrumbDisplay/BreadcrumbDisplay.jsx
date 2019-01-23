import React from 'react';
import {Button, Menu, MenuItem} from '@material-ui/core';
import {Folder, Public} from '@material-ui/icons';
import {PageIcon} from '@jahia/icons';
import {Typography, withStyles} from '@material-ui/core';
import {translate} from 'react-i18next';
import {ellipsizeText} from '../../../../../../ContentManager.utils';
import {compose} from 'react-apollo';

const styles = theme => ({
    contentLabel: {
        paddingLeft: theme.spacing.unit
    }
});

export class BreadcrumbDisplay extends React.Component {
    constructor(props) {
        super(props);

        this.onMenuButtonMouseOver = this.onMenuButtonMouseOver.bind(this);
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

    onMenuButtonMouseOver() {
        if (!this.state.menuActive) {
            this.setState({
                menuActive: true,
                anchorPosition: {
                    top: this.anchorButton.current.getBoundingClientRect().top - 5,
                    left: this.anchorButton.current.getBoundingClientRect().left
                }
            });
        }
    }

    onMenuItemSelected(event, node) {
        this.props.handleSelect(node.mode, node.path);
    }

    renderIcon(node) {
        switch (node.type) {
            case 'jnt:virtualsite':
                return <Public fontSize="small"/>;
            case 'jnt:folder':
            case 'jnt:contentFolder':
                return <Folder fontSize="small"/>;
            case 'jnt:page':
            default:
                return <PageIcon fontSize="small"/>;
        }
    }

    render() {
        let {menuActive, anchorPosition} = this.state;
        let {node, maxLabelLength, trimLabel, classes} = this.props;
        return (
            <span ref={this.menu}>
                <Button disableRipple
                        buttonRef={this.anchorButton}
                        aria-haspopup="true"
                        aria-owns={'breadcrumbMenu_' + node.uuid}
                        onMouseOver={() => node.siblings.length > 1 && this.onMenuButtonMouseOver()}
                        onClick={ev => node.siblings.length === 1 && this.onMenuItemSelected(ev, node.siblings[0])}
                >
                    {this.renderIcon(node, classes)}
                    {!trimLabel &&
                    <Typography variant="body1" color="textPrimary" data-cm-role="breadcrumb-name" classes={{root: classes.contentLabel}}>
                        {ellipsizeText(node.name, maxLabelLength)}
                    </Typography>
                    }
                </Button>
                <Menu key={node.uuid}
                      disableAutoFocusItem
                      anchorPosition={anchorPosition}
                      anchorReference="anchorPosition"
                      container={this.menu.current}
                      open={menuActive}
                      BackdropProps={{
                          style: {
                              opacity: 0
                          },
                          onMouseOver: () => {
                            this.setState({menuActive: false});
                        }
                      }}
                      onClose={() => this.setState({menuActive: false})}
                >
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
                            <MenuItem key={siblingNode.uuid}
                                      disableRipple
                                      onClick={event => this.onMenuItemSelected(event, siblingNode)}
                            >
                                {this.renderIcon(siblingNode, classes)}<Typography variant="body1" color="textPrimary" data-cm-role="breadcrumb-name" classes={{root: classes.contentLabel}}>{siblingNode.name}</Typography>
                            </MenuItem>
                        );
                    })}
                </Menu>
            </span>
        );
    }
}

export default compose(translate(), withStyles(styles))(BreadcrumbDisplay);
