import React, {useEffect} from 'react';

import styles from './Create.scss';
import PropTypes from 'prop-types';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer} from '../../../../utils/getButtonRenderer';

export const Create = ({element, onMouseOver, onMouseOut}) => {
    const rect = element.getBoundingClientRect();
    const scrollLeft = element.ownerDocument.documentElement.scrollLeft;
    const scrollTop = element.ownerDocument.documentElement.scrollTop;

    const buttonRenderer = getButtonRenderer({color: 'default', className: styles.button});

    let parent = element.dataset.jahiaParent && element.ownerDocument.getElementById(element.dataset.jahiaParent);
    if (!parent) {
        parent = element.parentElement;
        while (parent.getAttribute('jahiatype') !== 'module') {
            parent = parent.parentElement;
        }

        element.dataset.jahiaParent = parent.id;
    }

    useEffect(() => {
        element.style.height = '28px';
    });

    const path = parent.getAttribute('path');

    const currentOffset = {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width,
        height: 25
    };

    return (
        <div className={styles.root}
             style={currentOffset}
             data-jahia-parent={parent.getAttribute('id')}
             onMouseOver={onMouseOver}
             onMouseOut={onMouseOut}
             onDragOver={event => {
                event.preventDefault();
             }}
        >
            <DisplayAction actionKey="createContent" context={{path}} render={buttonRenderer}/>
            <DisplayAction actionKey="paste" context={{path}} render={buttonRenderer}/>
        </div>
    );
};

Create.propTypes = {
    element: PropTypes.any,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func
};
