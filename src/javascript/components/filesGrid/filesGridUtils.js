export const valueToSizeTransformation = function(value) {
    switch(value) {
        case 1 : return 2;
        case 2 : return 3;
        case 3 : return 4;
        case 4 : return 6;
        case 5 :
        default : return 12;
    }
};
