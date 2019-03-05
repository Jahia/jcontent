import React from 'react';
import {TwoColumnsContent, MainLayout} from '@jahia/layouts';
import {Typography} from '@jahia/ds-mui-theme';
import ImageEditionPreview from './ImageEditionPreview';
import {ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, withStyles} from '@material-ui/core';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';
import {ExpandMore} from '@material-ui/icons';
import RotatePanel from './RotatePanel';

let styles = () => ({

});

const ImageEdition = ({t}) => (
    <MainLayout topBarProps={{
        path: t('label.contentManager.appTitle', {path: ''}),
        title: t('label.contentManager.editImage.title'),
        contextModifiers: <React.Fragment></React.Fragment>,
        actions: <React.Fragment></React.Fragment>
    }}
    >
        <TwoColumnsContent rightCol={<ImageEditionPreview/>}>
            <RotatePanel/>
            <ExpansionPanel>
                <ExpansionPanelSummary expandIcon={<ExpandMore/>}>
                    <Typography variant="zeta" color="alpha">Resize</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <Typography variant="zeta" color="beta">
                        Resize
                    </Typography>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        </TwoColumnsContent>
    </MainLayout>
);

export default compose(
    translate(),
    withStyles(styles)
)(ImageEdition);
