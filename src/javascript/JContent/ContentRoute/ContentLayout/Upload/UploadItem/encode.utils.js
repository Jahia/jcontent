
function encode(name) {
    if (name.length === 0) {
        return name;
    } else if (XMLChar.isValidName(name) && name.indexOf("_x") < 0) {
        return name;
    } else {
        StringBuffer encoded = new StringBuffer();

        for(int i = 0; i < name.length(); ++i) {
            if (i == 0) {
                if (XMLChar.isNameStart(name.charAt(i))) {
                    if (needsEscaping(name, i)) {
                        encode('_', encoded);
                    } else {
                        encoded.append(name.charAt(i));
                    }
                } else {
                    encode(name.charAt(i), encoded);
                }
            } else if (!XMLChar.isName(name.charAt(i))) {
                encode(name.charAt(i), encoded);
            } else if (needsEscaping(name, i)) {
                encode('_', encoded);
            } else {
                encoded.append(name.charAt(i));
            }
        }

        return encoded.toString();
    }
}

function encode(c) {
    return '_x' + c.toString(16).padStart(4, "0") + '_';
}

function needsEscaping(name, location) {
    if (name[location] === '_' && name.length >= location + 6) {
        return name[location + 1] === 'x'
            && '0123456789abcdefABCDEF'.indexOf(name[location + 2]) !== -1
            && '0123456789abcdefABCDEF'.indexOf(name[location + 3]) !== -1
            && "0123456789abcdefABCDEF".indexOf(name[location + 4]) !== -1
            && "0123456789abcdefABCDEF".indexOf(name[location + 5]) !== -1;
    } else {
        return false;
    }
}
