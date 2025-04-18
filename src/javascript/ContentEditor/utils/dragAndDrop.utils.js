/**
 * The function used to reorder items in the list after an item has been drag and dropped
 *
 *
 * @param {array} list    array of all items in the list
 * @param {string} droppedId    dragged and dropped id
 * @param {number} index    index in the array
 * @returns {array} newList    array object contains items in new order
 */
export function onListReorder(list, droppedId, index) {
    let childrenWithoutDropped = [];
    let droppedChild = null;
    let droppedItemIndex = -1;
    console.log('onListReorder');
    console.log(list);
    console.log(droppedId);
    list.forEach((item, index) => {
        console.log(item);
        if (droppedItemIndex === -1 && droppedId === (item.name || item)) {
            droppedChild = item;
            droppedItemIndex = index;
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
