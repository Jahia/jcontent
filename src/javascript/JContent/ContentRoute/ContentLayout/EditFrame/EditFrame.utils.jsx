export const prefixCssSelectors = function (rules, className) {
    let classLen = className.length * 2;
    let char;
    let nextChar;
    let isAt;
    let isIn;

    // Removes comments
    rules = rules.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, '');

    // Convert rem to px on 16px base
    rules = rules.replace(/([\d.]+)rem/g, (match, p1) => ((16 * p1) + 'px'));

    // Makes sure nextChar will not target a space
    rules = rules.replace(/}(\s*)@/g, '}@');
    rules = rules.replace(/}(\s*)}/g, '}}');

    function handleRule(i) {
        let before = rules.slice(0, i + 1);
        let after = rules.slice(i + 1).trim();
        if (after.startsWith('.noprefix')) {
            after = after.substr(9);
            rules = before + after;
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

    for (var i = 0; i < rules.length - 2; i++) {
        char = rules[i];
        nextChar = rules[i + 1];

        if (char === '@' && !rules.substr(i).startsWith('@keyframes') && !rules.substr(i).startsWith('@font-face')) {
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

    handleRule(-1);

    return rules;
};
