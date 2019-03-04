import React from 'react';
import {FullWidthLayout, MainLayout} from '@jahia/layouts';
import {Paper} from '@material-ui/core';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';

const ImageEdition = ({t}) => (
    <MainLayout topBarProps={{
        path: t('label.contentManager.appTitle', {path: ''}),
        title: t('label.contentManager.editImage.title'),
        contextModifiers: <React.Fragment></React.Fragment>,
        actions: <React.Fragment></React.Fragment>
    }}
    >
        <FullWidthLayout>
            <Paper>Edition</Paper>
        </FullWidthLayout>
    </MainLayout>
);

export default compose(
    translate(),
)(ImageEdition);
