import React from 'react';

export const withTranslation = () => Component => props => {
    return <Component {...props} t={key => key}/>;
};
