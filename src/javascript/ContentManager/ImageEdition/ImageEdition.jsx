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
            rotate: 0
        };
        this.rotateLeft = this.rotateLeft.bind(this);
        this.rotateRight = this.rotateRight.bind(this);
    }

    rotateLeft() {
        let {rotate} = this.state;
        if (rotate === 0) {
            this.setState({
                rotate: 3
            });
        } else {
            this.setState({
                rotate: rotate - 1
            });
        }
    }

    rotateRight() {
        let {rotate} = this.state;
        if (rotate === 3) {
            this.setState({
                rotate: 0
            });
        } else {
            this.setState({
                rotate: rotate + 1
            });
        }
    }

    render() {
        let {t} = this.props;
        return (
            <MainLayout topBarProps={{
            path: t('label.contentManager.appTitle', {path: ''}),
            title: t('label.contentManager.editImage.title'),
            contextModifiers: <React.Fragment></React.Fragment>,
            actions: <React.Fragment></React.Fragment>
        }}
            >
                <TwoColumnsContent rightCol={<ImageEditionPreview rotate={this.state.rotate}/>}>
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
