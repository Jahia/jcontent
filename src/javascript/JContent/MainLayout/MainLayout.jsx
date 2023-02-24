import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import styles from './MainLayout.scss';
import {useResize, ResizeContext} from './ResizeObserver';

export const MainLayout = ({header, children}) => {
    const {ref, width} = useResize();

    return (
        <main ref={ref} className={clsx(styles.root, 'flexCol')}>
            <ResizeContext.Provider value={width}>
                { header &&
                    header}
                <div className={clsx(styles.content, 'flexCol_nowrap')}>
                    {children}
                </div>
            </ResizeContext.Provider>
        </main>
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
