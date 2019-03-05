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

export class ImageEdition extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rotateLeft: 0,
            rotateRight: 0
        };
        this.rotateLeft = this.rotateLeft.bind(this);
        this.rotateRight = this.rotateRight.bind(this);
    }

    rotateLeft() {
        let {rotateLeft} = this.state;
        this.setState({
            rotateLeft: rotateLeft + 1
        });
    }

    rotateRight() {
        let {rotateRight} = this.state;
        this.setState({
            rotateRight: rotateRight + 1
        });
    }

    render() {
        let {t} = this.props;
        let rotations = (this.state.rotateRight - this.state.rotateLeft) % 4;
        return (
            <MainLayout topBarProps={{
            path: t('label.contentManager.appTitle', {path: ''}),
            title: t('label.contentManager.editImage.title'),
            contextModifiers: <React.Fragment></React.Fragment>,
            actions: <React.Fragment></React.Fragment>
        }}
            >
                <TwoColumnsContent rightCol={<ImageEditionPreview rotations={rotations}/>}>
                    <RotatePanel rotateLeft={this.rotateLeft} rotateRight={this.rotateRight}/>
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
    }
}

export default compose(
    translate(),
    withStyles(styles)
)(ImageEdition);
