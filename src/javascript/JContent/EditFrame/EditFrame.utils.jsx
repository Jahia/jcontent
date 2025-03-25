function handleSkipped(char, inSkip) {
    if (char === '{') {
        inSkip++;
    }

    if (char === '}') {
        inSkip--;

        if (inSkip === 1) {
            inSkip = 0;
        }
    }

    return inSkip;
}

export const prefixCssSelectors = function (rules, className) {
    const classLen = className.length * 2;
    let char;
    let nextChar;
    let isAt;
    let isIn;
    let inSkip;

    // Removes comments
    rules = rules.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, '');

    // Convert rem to px on 16px base
    rules = rules.replace(/([\d.]+)rem/g, (match, p1) => (`${16 * p1}px`));

    // Makes sure nextChar will not target a space
    rules = rules.replace(/}(\s*)@/g, '}@');
    rules = rules.replace(/}(\s*)}/g, '}}');

    function handleRule(i) {
        const before = rules.slice(0, i + 1);
        let after = rules.slice(i + 1).trim();
        if (after.startsWith('.noprefix')) {
            after = after.substr(9);
            rules = before + after;
        } else if (after.startsWith('html ')) {
            rules = before + className + className + ' ' + after.substr(4);
        } else if (!after.startsWith(className)) {
            if (after.startsWith(':root')) {
                after = after.substr(5);
                i -= 5;
            }

            rules = before + className + className + ' ' + after;
            i += classLen;
            isAt = false;
        }

        return i;
    }

    for (let i = 0; i < rules.length - 2; i++) {
        char = rules[i];
        nextChar = rules[i + 1];

        if (rules.substr(i).startsWith('@keyframes') || rules.substr(i).startsWith('@font-face')) {
            inSkip = 1;
        }

        if (inSkip) {
            inSkip = handleSkipped(char, inSkip);
        } else {
            if (char === '@') {
                isAt = true;
            }

            if (!isAt && char === '{') {
                isIn = true;
            }

            if (isIn && char === '}') {
                isIn = false;
            }

            if (!isIn && nextChar !== '@' && nextChar !== '}' && (char === '}' || char === ',' || ((char === '{' || char === ';') && isAt))) {
                i = handleRule(i);
            }
        }
    }

    handleRule(-1);

    return rules;
};

export const getCoords = elem => {
    const box = elem.getBoundingClientRect();

    const body = elem.ownerDocument.body;
    const docEl = elem.ownerDocument.documentElement;

    const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    const clientTop = docEl.clientTop || body.clientTop || 0;
    const clientLeft = docEl.clientLeft || body.clientLeft || 0;

    const top = box.top + scrollTop - clientTop;
    const left = box.left + scrollLeft - clientLeft;

    return {
        top: Math.round(top),
        left: Math.round(left),
        width: box.width,
        height: box.height
    };
};

export const getBoundingBox = (element, isHeaderDisplayed) => {
    const rect = getCoords(element);

    const left = rect.left;
    const width = rect.width;
    const top = rect.top;
    const height = rect.height + (isHeaderDisplayed ? 0 : 4);
    return {top, left, width, height};
};
