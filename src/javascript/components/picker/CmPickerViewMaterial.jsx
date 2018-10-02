import React from 'react';
import {
    IconButton,
    List,
    ListItem,
    Button,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    SvgIcon,
    withStyles,
    withTheme
} from '@material-ui/core';
import {KeyboardArrowDown, KeyboardArrowRight} from '@material-ui/icons';
import PropTypes from 'prop-types';
import defaultIconRenderer from './iconRenderer';

let styles = (theme) => ({
    root: {
        position: "relative",
        padding: '0!important',
    },
    loading: {
        opacity: 0.8
    },
    listItemSelected: {
        background: '#007cb0',
        color: '#F5F5F5!important'
    },
    listItem: {
        fontFamily: '"Nunito sans", sans-serif',
        backgroundPosition: 'left 10px center',
        backgroundRepeat: 'no-repeat',
        padding: '0!important',
        fontWeight: 300,
        fontSize: '0.928rem',
        whiteSpace: 'nowrap'
    },
    listItemLabel: {
        color: '#5E6565',
        fontWeight: '300',
        fontSize: '0.928rem',
        padding: '0!important',
        '& h3': {
            fontSize: '0.875rem',
            color: '#5E6565',
            fontWeight: '100'
        }
    },
    listItemToggle: {
        marginRight: '0px',
        borderRadius: '0',
        width: 'auto'
    },
    listItemNodeTypeIcon: {
        marginRight: '5px',
        color: '#5c6164'
    },
    selectedText: {
        color: 'whitesmoke!important'
    },
    loadingContainer: {
        position: "absolute",
        width: "100%",
        height: "100%",
        zIndex: 999
    },
    toggleUnSelected: {
        color: '#00a0e3'
    },
    toggleSelected: {
        color: 'whitesmoke'
    },
    buttonContainer: {
        padding: '6px 4px 6px 4px',
        '&:hover': {
            backgroundColor: 'transparent'
        }
    },
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
    },
    test: {
        fontFamily: '"Nunito sans", sans-serif',
        backgroundSize: '20px',
        backgroundPosition: 'left 10px center',
        backgroundRepeat: 'no-repeat',
        fontWeight: 300,
        fontSize: '0.928rem',
        whiteSpace: 'nowrap',
        color: '#F5F5F5'
    },
    treeEntry: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer !important'
    }
});

class CmPickerViewMaterial extends React.Component {

    render() {

        let {classes, pickerEntries, onOpenItem, onSelectItem, textRenderer, actionsRenderer, iconRenderer, loading} = this.props;

        return <div className={classes.root}>
            {loading &&
                <div className={classes.loadingContainer}/>
            }
            <List disablePadding classes={{root: loading ? (classes.root + ' ' + classes.loading) : classes.root}}>
                {
                    pickerEntries.map((entry) =>
                        <ListItem
                            onDoubleClick={() => {onOpenItem(entry.path, !entry.open);}}
                            key={entry.path}
                            divider={true}
                            className={entry.selected ? (classes.listItem + ' ' + classes.listItemSelected) : classes.listItem}
                            data-jrm-role={'picker-item'}
                        >
                            <div
                                className={entry.selected ? (classes.listItemToggle + ' ' + classes.selectedText) : classes.listItemToggle}
                                style={{
                                    paddingLeft: (entry.depth + 1) * 20,
                                    opacity: (entry.openable && entry.hasChildren ? 1 : 0)
                                }}
                            >
                                <Button
                                    className={classes.buttonContainer}
                                    onClick={(event) => {
                                        onOpenItem(entry.path, !entry.open);
                                        event.stopPropagation()
                                    }}
                                    disabled={!(entry.openable && entry.hasChildren)}
                                    data-jrm-role={'picker-item-toggle'}
                                    data-jrm-state={entry.open ? 'open' : 'closed'}
                                >
                                    <div className={entry.open ? (classes.triangle_bottom) : classes.triangle}/>
                                </Button>
                            </div>
                            <span className={classes.treeEntry} onClick={() => entry.selectable ? onSelectItem(entry.path, !entry.selected) : null}>
                                <ListItemIcon className={entry.selected ? (classes.listItemNodeTypeIcon + ' ' + classes.selectedText) : classes.listItemNodeTypeIcon}>
                                    {iconRenderer ? iconRenderer(entry) : defaultIconRenderer(entry)}
                                </ListItemIcon>
                                <ListItemText
                                    inset
                                    classes={entry.selected ? {
                                        root: classes.listItemLabel,
                                        primary: classes.selectedText
                                    } : {
                                        root: classes.listItemLabel
                                    }}
                                    disableTypography={true}
                                    primary={textRenderer ? textRenderer(entry) : entry.name}
                                    data-jrm-role={'picker-item-text'}
                                />
                            </span>
                            {actionsRenderer &&
                                <ListItemText>
                                    {actionsRenderer(entry)}
                                </ListItemText>
                            }
                        </ListItem>
                    )
                }
            </List>
        </div>;
    }
};

CmPickerViewMaterial.propTypes = {
    pickerEntries: PropTypes.array.isRequired,
    onSelectItem: PropTypes.func,
    onOpenItem: PropTypes.func,
    textRenderer: PropTypes.func
};

CmPickerViewMaterial = withTheme()(withStyles(styles, {name: "DxPickerViewMaterial"})(CmPickerViewMaterial));

export {CmPickerViewMaterial};
