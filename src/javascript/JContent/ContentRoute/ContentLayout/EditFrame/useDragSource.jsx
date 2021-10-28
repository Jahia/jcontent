import styles from './EditFrame.scss';

export const useDragSource = ({element}) => {
    const dragClassName = styles.enablePointerEvents;

    const onDragStart = e => {
        e.dataTransfer.setData('application/json', JSON.stringify(
            {sourceElement: element.getAttribute('id')}
        ));
        e.dataTransfer.setDragImage(element, 0, 0);
        element.style.opacity = 0.4;
        element.ownerDocument.body.classList.add(styles.disablePointerEvents);
    };

    const onDragEnd = () => {
        element.style.opacity = 1;
        element.ownerDocument.body.classList.remove(styles.disablePointerEvents);
    };

    return {
        dragClassName,
        onDragStart,
        onDragEnd
    };
};
