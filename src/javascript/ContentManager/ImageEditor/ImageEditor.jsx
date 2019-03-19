import React from 'react';
import PropTypes from 'prop-types';
import {MainLayout, TwoColumnsContent} from '@jahia/layouts';
import {
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary,
    IconButton,
    Typography
} from '@jahia/ds-mui-theme';
import ImageEditorPreview from './ImageEditorPreview';
import {Tooltip, withStyles} from '@material-ui/core';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';
import RotatePanel from './RotatePanel';
import ResizePanel from './ResizePanel';
import CropPanel from './CropPanel';
import {Check, ChevronLeft, ExpandMore} from '@material-ui/icons';
import Feedback from './Feedback';
import ImageEditorActions from './ImageEditorActions';

let styles = theme => ({
    left: {
        overflow: 'auto'
    },
    panel: {
        display: 'flex',
        flexDirection: 'column'
    },
    right: {
        justifyContent: 'center',
        background: theme.palette.ui.omega,
        paddingRight: theme.spacing.unit * 2
    },
    feedbackContent: {
        display: 'flex'
    },
    feedbackIcon: {
        marginRight: theme.spacing.unit
    }
});

const PANELS = {
    ROTATE: 0,
    RESIZE: 1,
    CROP: 2
};

export class ImageEditor extends React.Component {
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
        const {
            t, classes, node, rotations, width, height, rotate, resize, undoChanges, cropParams, onCropChange, crop,
            saveChanges, onBackNavigation, ts, dxContext, confirmSaved, closeFeedback, editing, closeEditingToast,
            calculateCoordinate
        } = this.props;
        const {expanded} = this.state;
        const originalWidth = node.width ? parseInt(node.width.value, 10) : 0;
        const originalHeight = node.height ? parseInt(node.height.value, 10) : 0;

        let resizeDirty = Boolean((width && originalWidth !== width) || (height && originalHeight !== height));
        let rotationsDirty = (rotations !== 0);

        let dirty = resizeDirty || rotationsDirty;

        let changesFeedback = dirty ? t('label.contentManager.editImage.unsavedChanges') : '';

        return (
            <MainLayout topBarProps={{
                path: (
                    <React.Fragment>
                        <Typography variant="omega" color="invert">
                            <IconButton color="inverted"
                                        size="compact"
                                        icon={<ChevronLeft/>}
                                        onClick={() => onBackNavigation(dirty)}/>
                            {t('label.contentManager.editImage.goBack')}
                        </Typography>
                    </React.Fragment>
                ),
                title: node.name,
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
                                   rightCol={<ImageEditorPreview rotations={rotations}
                                                                 dxContext={dxContext}
                                                                 cropParams={cropParams}
                                                                 originalHeight={originalHeight}
                                                                 originalWidth={originalWidth}
                                                                 path={node.path}
                                                                 ts={ts}
                                                                 cropExpanded={expanded === PANELS.CROP}
                                                                 calculateCoordinate={calculateCoordinate}
                                                                 onCropChange={onCropChange}
                                   />}
                >
                    <>
                        <Tooltip title={resizeDirty ? t('label.contentManager.editImage.tooltip') : ''}>
                            <ExpansionPanel disabled={resizeDirty}
                                            expanded={expanded === PANELS.ROTATE}
                                            data-cm-role="rotate-panel"
                                            onChange={(event, expanded) => expanded && !resizeDirty && this.onChangePanel(PANELS.ROTATE)}
                            >
                                <ExpansionPanelSummary expandIcon={expanded !== PANELS.ROTATE && <ExpandMore/>}>
                                    <Typography variant="zeta"
                                                color="alpha"
                                    >{t('label.contentManager.editImage.rotate')}
                                    </Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails className={classes.panel}>
                                    <RotatePanel rotate={rotate}/>
                                </ExpansionPanelDetails>
                                <ImageEditorActions dirty={dirty} undoChanges={undoChanges} saveChanges={saveChanges}/>
                            </ExpansionPanel>
                        </Tooltip>
                        <Tooltip title={rotationsDirty ? t('label.contentManager.editImage.tooltip') : ''}>
                            <ExpansionPanel disabled={rotationsDirty}
                                            expanded={expanded === PANELS.RESIZE}
                                            data-cm-role="resize-panel"
                                            onChange={(event, expanded) => expanded && !rotationsDirty && this.onChangePanel(PANELS.RESIZE)}
                            >
                                <ExpansionPanelSummary expandIcon={expanded !== PANELS.RESIZE && <ExpandMore/>}>
                                    <Typography variant="zeta"
                                                color="alpha"
                                    >{t('label.contentManager.editImage.resize')}
                                    </Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails className={classes.panel}>
                                    <ResizePanel originalWidth={originalWidth}
                                                 originalHeight={originalHeight}
                                                 width={width}
                                                 height={height}
                                                 resize={resize}
                                    />
                                </ExpansionPanelDetails>
                                <ImageEditorActions dirty={dirty} undoChanges={undoChanges} saveChanges={saveChanges}/>
                            </ExpansionPanel>
                        </Tooltip>
                        <Tooltip title={rotationsDirty ? t('label.contentManager.editImage.tooltip') : ''}>
                            <ExpansionPanel disabled={rotationsDirty}
                                            expanded={expanded === PANELS.CROP}
                                            data-cm-role="crop-panel"
                                            onChange={(event, expanded) => expanded && !rotationsDirty && this.onChangePanel(PANELS.CROP)}
                            >
                                <ExpansionPanelSummary expandIcon={expanded !== PANELS.CROP && <ExpandMore/>}>
                                    <Typography variant="zeta"
                                                color="alpha"
                                    >{t('label.contentManager.editImage.cropParams')}
                                    </Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails className={classes.panel}>
                                    <CropPanel originalWidth={originalWidth}
                                               originalHeight={originalHeight}
                                               cropParams={cropParams}
                                               width={width}
                                               height={height}
                                               crop={crop}
                                               onCropChange={onCropChange}
                                    />
                                </ExpansionPanelDetails>
                                <ImageEditorActions dirty={dirty} undoChanges={undoChanges} saveChanges={saveChanges}/>
                            </ExpansionPanel>
                        </Tooltip>
                    </>
                </TwoColumnsContent>
                <Feedback
                    open={editing}
                    duration={2000}
                    message={
                        <div className={classes.feedbackContent}>
                            <Check className={classes.feedbackIcon}/>
                            <Typography variant="zeta" color="invert">
                                {t('label.contentManager.editImage.editingMessage', {imageName: node.name})}
                            </Typography>
                        </div>}
                    onClose={closeEditingToast}
                />
                <Feedback
                    open={confirmSaved}
                    duration={2000}
                    message={
                        <div className={classes.feedbackContent}>
                            <Check className={classes.feedbackIcon}/>
                            <Typography variant="zeta" color="invert">
                                {t('label.contentManager.editImage.savedMessage')}
                            </Typography>
                        </div>}
                    onClose={closeFeedback}
                />
            </MainLayout>
        );
    }
}

ImageEditor.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired,
    height: PropTypes.number,
    width: PropTypes.number,
    rotations: PropTypes.number.isRequired,
    resize: PropTypes.func.isRequired,
    rotate: PropTypes.func.isRequired,
    onBackNavigation: PropTypes.func.isRequired,
    saveChanges: PropTypes.func.isRequired,
    ts: PropTypes.number.isRequired,
    undoChanges: PropTypes.func.isRequired,
    dxContext: PropTypes.object.isRequired,
    confirmSaved: PropTypes.bool.isRequired,
    closeFeedback: PropTypes.func.isRequired,
    closeEditingToast: PropTypes.func.isRequired,
    editing: PropTypes.bool.isRequired,
    cropParams: PropTypes.object,
    crop: PropTypes.func.isRequired,
    onCropChange: PropTypes.func.isRequired,
    calculateCoordinate: PropTypes.func.isRequired
};

export default compose(
    translate(),
    withStyles(styles)
)(ImageEditor);

