/**
 * The function used to reorder items in the field after an item has been drag and dropped
 *
 *
 * @param {array} list    array of all items in the field
 * @param {string} droppedId    dragged and dropped id
 * @param {number} index    index in the array
 * @param {string} fieldName    name of dropped item field
 * @returns {array} newList    array object contains items in new order
 */
export function onListReorder(list, droppedId, index, fieldName) {
    let childrenWithoutDropped = [];
    let droppedChild = null;
    let droppedItemIndex = -1;

    list.forEach((item, i) => {
        if (droppedItemIndex === -1 && droppedId === `${fieldName}[${i}]`) {
            droppedChild = item;
            droppedItemIndex = i;
        } else {
            childrenWithoutDropped.push(item);
        }
    });

    if (droppedChild !== null && droppedItemIndex >= 0) {
        // +1 for droppedItemIndex here as index parameter from handleReOrder is starting from 1 instead of 0
        const spliceIndex = ((droppedItemIndex + 1) < index) ? index - 1 : index;
        const newList = [...childrenWithoutDropped.slice(0, spliceIndex), droppedChild, ...childrenWithoutDropped.slice(spliceIndex, childrenWithoutDropped.length)];
        return newList;
    }

    return list;
}

/**
 * The function used to reorder items in the field after a reorder button from the item has been clicked
 *
 *
 * @param {array} list    array of all items in the field
 * @param {string} droppedId    dragged and dropped id
 * @param {string} direction    direction to move the item to
 * @param {string} fieldName    name of dropped item field
 * @returns {array} newList    array object contains items in new order
 */
export function onDirectionalReorder(list, droppedId, direction, fieldName) {
    let childrenWithoutDropped = [];
    let droppedChild = null;
    let droppedItemIndex = -1;
    list.forEach((item, index) => {
        if (droppedItemIndex === -1 && droppedId === `${fieldName}[${index}]`) {
            droppedChild = item;
            droppedItemIndex = index;
        } else {
            childrenWithoutDropped.push(item);
        }
    });

    if (droppedChild !== null && droppedItemIndex >= 0) {
        let newIndex = droppedItemIndex;

        if (direction === 'up' && droppedItemIndex > 0) {
            newIndex = droppedItemIndex - 1;
        } else if (direction === 'down' && droppedItemIndex < list.length - 1) {
            newIndex = droppedItemIndex + 1;
        } else if (direction === 'first') {
            newIndex = 0;
        } else if (direction === 'last') {
            newIndex = list.length - 1;
        }

        if (newIndex !== droppedItemIndex) {
            const newList = [...childrenWithoutDropped];
            newList.splice(newIndex, 0, droppedChild);
            return newList;
        }
    }
}
