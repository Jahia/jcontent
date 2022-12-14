import React, {useEffect} from 'react';

import styles from './Create.scss';
import PropTypes from 'prop-types';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer} from '~/utils/getButtonRenderer';
import clsx from 'clsx';
import {useNodeDrop} from '~/JContent/dnd/useNodeDrop';
import {useNodeInfo} from '@jahia/data-helper';
import editStyles from './EditFrame.scss';
import {useDragLayer} from 'react-dnd';

export const Create = ({element, onMouseOver, onMouseOut, onSaved}) => {
    const rect = element.getBoundingClientRect();
    const scrollLeft = element.ownerDocument.documentElement.scrollLeft;
    const scrollTop = element.ownerDocument.documentElement.scrollTop;

    const ButtonRenderer = getButtonRenderer({defaultButtonProps: {color: 'default'}});

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

    const parentPath = parent.getAttribute('path');

    const {node} = useNodeInfo({path: parentPath}, {
        getPrimaryNodeType: true
    });

    const [{isCanDrop}, drop] = useNodeDrop({dropTarget: parent && node, onSaved});

    const {anyDragging} = useDragLayer(monitor => ({
        anyDragging: monitor.isDragging()
    }));

    const currentOffset = {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width,
        height: 25
    };

    const nodePath = element.getAttribute('path') === '*' ? null : element.getAttribute('path');
    const nodetypes = element.getAttribute('nodetypes') ? element.getAttribute('nodetypes').split(' ') : null;

    useEffect(() => {
        if (isCanDrop) {
            element.classList.add(styles.dropTarget);
        }

        return () => {
            element.classList.remove(styles.dropTarget);
        };
    }, [isCanDrop, element]);

    return !anyDragging && (
        <div ref={drop}
             className={clsx(styles.root, editStyles.enablePointerEvents)}
             style={currentOffset}
             data-jahia-parent={parent.getAttribute('id')}
             onMouseOver={onMouseOver}
             onMouseOut={onMouseOut}
        >
            <DisplayAction actionKey="createContent" path={parentPath} name={nodePath} nodeTypes={nodetypes} loading={() => false} render={ButtonRenderer}/>
            <DisplayAction actionKey="paste" path={parentPath} loading={() => false} render={ButtonRenderer}/>
        </div>
    );
};

Create.propTypes = {
    element: PropTypes.any,
    onMouseOver: PropTypes.func,
    onMouseOut: PropTypes.func,
    onSaved: PropTypes.func
};
