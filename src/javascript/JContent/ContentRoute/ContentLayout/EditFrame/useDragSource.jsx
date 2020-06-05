export const useDragSource = ({element}) => {
    const dragClassName = 'dropTarget';

    const onDragStart = e => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/json', JSON.stringify(
            {sourceElement: element.getAttribute('id')}
        ));
        e.dataTransfer.setDragImage(element, 0, 0);
        element.style.opacity = 0.4;
        element.ownerDocument.body.classList.add('dragdrop');
    };

    const onDragEnd = () => {
        element.style.opacity = 1;
        element.ownerDocument.body.classList.remove('dragdrop');
    };

    return {
        dragClassName,
        onDragStart,
        onDragEnd
    };
};
