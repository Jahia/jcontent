import React from 'react';
import PropTypes from 'prop-types';
import {
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary,
    TwoColumnsContent
} from '@jahia/design-system-kit';
import ImageEditorPreview from './ImageEditorPreview';
import {Tooltip} from '@material-ui/core';
import {withTranslation} from 'react-i18next';
import RotatePanel from './RotatePanel';
import ResizePanel from './ResizePanel';
import CropPanel from './CropPanel';
import {Button, ChevronDown, Chip, Edit, Header, Typography} from '@jahia/moonstone';
import ImageEditorActions from './ImageEditorActions';
import MainLayout from '../MainLayout';
import styles from './ImageEditor.scss';

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
            t,
            path,
            originalWidth,
            originalHeight,
            resizeParams,
            rotationParams,
            cropParams,
            onResize,
            onRotate,
            onCrop,
            onBackNavigation,
            saveChanges,
            undoChanges
        } = this.props;
        const {expanded} = this.state;

        let dirty = resizeParams.dirty || rotationParams.dirty || cropParams.dirty;
        let name = path.substr(path.lastIndexOf('/') + 1);
        let changesFeedback = dirty ? t('jcontent:label.contentManager.editImage.unsavedChanges') : '';

        return (
            <MainLayout
                header={
                    <Header title={name}
                            backButton={<Button onClick={() => onBackNavigation(dirty)}/>}
                    />
                }
            >
                <TwoColumnsContent classes={{root: styles.root, left: styles.left, right: styles.right}}
                                   rightCol={<ImageEditorPreview isCropExpanded={expanded === PANELS.CROP}
                                                                 path={this.props.path}
                                                                 ts={this.props.ts}
                                                                 cropParams={this.props.cropParams}
                                                                 rotationParams={this.props.rotationParams}
                                                                 resizeParams={this.props.resizeParams}
                                                                 originalWidth={this.props.originalWidth}
                                                                 originalHeight={this.props.originalHeight}
                                                                 onCrop={this.props.onCrop}
                                                                 onImageLoaded={this.props.onImageLoaded}/>}
                >
                    <>
                        <Tooltip title={(resizeParams.dirty || cropParams.dirty) ? t('jcontent:label.contentManager.editImage.tooltip') : ''}>
                            <ExpansionPanel disabled={resizeParams.dirty || cropParams.dirty}
                                            expanded={expanded === PANELS.ROTATE}
                                            data-cm-role="rotate-panel"
                                            onChange={(event, expanded) => expanded && !resizeParams.dirty && !cropParams.dirty && this.onChangePanel(PANELS.ROTATE)}
                            >
                                <ExpansionPanelSummary expandIcon={expanded !== PANELS.ROTATE && <ChevronDown/>} classes={{content: styles.title}}>
                                    <Typography variant="heading">{t('jcontent:label.contentManager.editImage.rotate')}</Typography> {changesFeedback && <Chip icon={<Edit/>} label={changesFeedback} color="warning"/> }
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails className={styles.panel}>
                                    <RotatePanel onRotate={onRotate}/>
                                </ExpansionPanelDetails>
                                <ImageEditorActions isDirty={dirty} undoChanges={undoChanges} saveChanges={saveChanges}/>
                            </ExpansionPanel>
                        </Tooltip>
                        <Tooltip title={(rotationParams.dirty || cropParams.dirty) ? t('jcontent:label.contentManager.editImage.tooltip') : ''}>
                            <ExpansionPanel disabled={rotationParams.dirty || cropParams.dirty}
                                            expanded={expanded === PANELS.RESIZE}
                                            data-cm-role="resize-panel"
                                            onChange={(event, expanded) => expanded && !rotationParams.dirty && !cropParams.dirty && this.onChangePanel(PANELS.RESIZE)}
                            >
                                <ExpansionPanelSummary expandIcon={expanded !== PANELS.RESIZE && <ChevronDown/>} classes={{content: styles.title}}>
                                    <Typography variant="heading">{t('jcontent:label.contentManager.editImage.resize')}</Typography> {changesFeedback && <Chip icon={<Edit/>} label={changesFeedback} color="warning"/> }
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails className={styles.panel}>
                                    <ResizePanel originalWidth={originalWidth}
                                                 originalHeight={originalHeight}
                                                 resizeParams={resizeParams}
                                                 onResize={onResize}
                                    />
                                </ExpansionPanelDetails>
                                <ImageEditorActions isDirty={dirty} undoChanges={undoChanges} saveChanges={saveChanges}/>
                            </ExpansionPanel>
                        </Tooltip>
                        <Tooltip title={(resizeParams.dirty || rotationParams.dirty) ? t('jcontent:label.contentManager.editImage.tooltip') : ''}>
                            <ExpansionPanel disabled={resizeParams.dirty || rotationParams.dirty}
                                            expanded={expanded === PANELS.CROP}
                                            data-cm-role="crop-panel"
                                            onChange={(event, expanded) => expanded && !resizeParams.dirty && !rotationParams.dirty && this.onChangePanel(PANELS.CROP)}
                            >
                                <ExpansionPanelSummary expandIcon={expanded !== PANELS.CROP && <ChevronDown/>} classes={{content: styles.title}}>
                                    <Typography variant="heading">{t('jcontent:label.contentManager.editImage.crop')}</Typography> {changesFeedback && <Chip icon={<Edit/>} label={changesFeedback} color="warning"/> }
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails className={styles.panel}>
                                    <CropPanel cropParams={cropParams}
                                               onCrop={onCrop}
                                    />
                                </ExpansionPanelDetails>
                                <ImageEditorActions isDirty={dirty} undoChanges={undoChanges} saveChanges={saveChanges}/>
                            </ExpansionPanel>
                        </Tooltip>
                    </>
                </TwoColumnsContent>
            </MainLayout>
        );
    }
}

ImageEditor.propTypes = {
    t: PropTypes.func.isRequired,
    path: PropTypes.string,
    ts: PropTypes.number.isRequired,
    originalWidth: PropTypes.number,
    originalHeight: PropTypes.number,
    resizeParams: PropTypes.object.isRequired,
    rotationParams: PropTypes.object.isRequired,
    cropParams: PropTypes.object,
    onResize: PropTypes.func.isRequired,
    onRotate: PropTypes.func.isRequired,
    onCrop: PropTypes.func.isRequired,
    onImageLoaded: PropTypes.func.isRequired,
    onBackNavigation: PropTypes.func.isRequired,
    saveChanges: PropTypes.func.isRequired,
    undoChanges: PropTypes.func.isRequired
};

export default withTranslation()(ImageEditor);
