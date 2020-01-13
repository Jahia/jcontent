import React from 'react';

jest.mock('react-i18next', () => ({
    // This mock makes sure any components using the translate HoC receive the t function as a prop
    withTranslation: () => Component => props => {
        return <Component {...props} t={key => key}/>;
    }
}));
