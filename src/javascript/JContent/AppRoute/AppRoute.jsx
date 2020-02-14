import React from 'react';
import PropTypes from 'prop-types';
import {FullWidthContent} from '@jahia/design-system-kit';
import IFrameLayout from './IFrameLayout';
import MainLayout from '../MainLayout';

const AppRoute = ({dxContext}) => (
    <MainLayout>
        <FullWidthContent>
            <IFrameLayout
                contextPath={dxContext.contextPath}
                workspace={dxContext.workspace}/>
        </FullWidthContent>
    </MainLayout>
);

AppRoute.propTypes = {
    dxContext: PropTypes.object.isRequired
};

export default AppRoute;
