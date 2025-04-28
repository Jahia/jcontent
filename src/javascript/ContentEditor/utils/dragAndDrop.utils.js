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
