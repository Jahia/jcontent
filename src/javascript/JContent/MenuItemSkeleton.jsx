import React from 'react';
import styles from './MenuItemSkeleton.module.scss';

export const MenuItemSkeleton = () => (
    <div className={styles.menuItemSkeleton} data-sel-role="menu-item-skeleton">
        <div className={styles.bar}/>
    </div>
);
