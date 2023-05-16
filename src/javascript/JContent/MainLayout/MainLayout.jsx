import React from 'react';
import PropTypes from 'prop-types';
import {ResizeContext, useResize} from './ResizeObserver';
import {LayoutContent} from '@jahia/moonstone';
import styles from './MainLayout.scss';
export const MainLayout = ({header, children}) => {
    const {ref, width} = useResize();

    return (
        <ResizeContext.Provider value={width}>
            <LayoutContent ref={ref} hasPadding content={children} header={header} className={styles.layout}/>
        </ResizeContext.Provider>
    );
};

MainLayout.propTypes = {
    header: PropTypes.node,
    children: PropTypes.node.isRequired
};

MainLayout.defaultProps = {
    header: null
};

export default MainLayout;
