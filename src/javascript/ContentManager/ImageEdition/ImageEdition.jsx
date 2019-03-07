import React from 'react';
import PropTypes from 'prop-types';
import {MainLayout, TwoColumnsContent} from '@jahia/layouts';
import {Typography, IconButton} from '@jahia/ds-mui-theme';
import ImageEditionPreview from './ImageEditionPreview';
import {withStyles} from '@material-ui/core';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';
import RotatePanel from './RotatePanel';
import ResizePanel from './ResizePanel';
import {ChevronLeft} from '@material-ui/icons';
import UnsavedChangesDialog from './UnsavedChangesDialog';

let styles = theme => ({
    left: {
        overflow: 'auto'
    },
    right: {
        justifyContent: 'center',
        background: theme.palette.ui.omega,
        paddingRight: theme.spacing.unit * 2
    }
});

export const PANELS = {
    ROTATE: 0,
    RESIZE: 1
};

export class ImageEdition extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: PANELS.ROTATE
        };
        this.onChangePanel = this.onChangePanel.bind(this);
    }

    onChangePanel(panel) {
        this.setState({
            expanded: panel
        });
    }

    render() {
        const {t, classes, node, rotations, width, height, rotate, resize, undoChanges, saveAsChanges, saveChanges, openConfirmDialog, onBackNavigation, onCloseDialog, ts} = this.props;
        const {expanded} = this.state;
        const originalWidth = parseInt(node.width.value, 10);
        const originalHeight = parseInt(node.height.value, 10);

        let resizeDirty = Boolean((width && originalWidth !== width) || (height && originalHeight !== height));
        let rotationsDirty = (rotations !== 0);

        let dirty = resizeDirty || rotationsDirty;

        let changesFeedback = dirty ? t('label.contentManager.editImage.unsavedChanges') : '';

        return (
            <MainLayout topBarProps={{
                path: (
                    <React.Fragment>
                        <Typography variant="omega" color="invert">
                            <IconButton color="inverted" size="compact" icon={<ChevronLeft/>} onClick={() => onBackNavigation(dirty)}/>
                            {t('label.contentManager.editImage.goBack')}
                        </Typography>
                    </React.Fragment>
                ),
                title: t('label.contentManager.editImage.title'),
                contextModifiers: <React.Fragment></React.Fragment>,
                actions: (
                    <React.Fragment>
                        <Typography variant="omega" color="invert">
                            {changesFeedback}
                        </Typography>
                    </React.Fragment>
                )
            }}
            >
                <TwoColumnsContent classes={{left: classes.left, right: classes.right}}
                                   rightCol={<ImageEditionPreview rotations={rotations} path={node.path} ts={ts}/>}
                >
                    <>
                        <RotatePanel defaultExpanded
                                     dirty={rotationsDirty}
                                     expanded={expanded === PANELS.ROTATE}
                                     disabled={resizeDirty}
                                     rotate={rotate}
                                     undoChanges={undoChanges}
                                     saveAsChanges={saveAsChanges}
                                     saveChanges={saveChanges}
                                     onChangePanel={this.onChangePanel}
                        />
                        <ResizePanel expanded={expanded === PANELS.RESIZE}
                                     dirty={resizeDirty}
                                     originalWidth={originalWidth}
                                     originalHeight={originalHeight}
                                     width={width}
                                     height={height}
                                     disabled={rotationsDirty}
                                     resize={resize}
                                     undoChanges={undoChanges}
                                     saveAsChanges={saveAsChanges}
                                     saveChanges={saveChanges}
                                     onChangePanel={this.onChangePanel}
                        />
                    </>
                </TwoColumnsContent>
                <UnsavedChangesDialog open={openConfirmDialog} onClose={onCloseDialog}/>
            </MainLayout>
        );
    }
}

ImageEdition.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired
};

export default compose(
    translate(),
    withStyles(styles)
)(ImageEdition);
