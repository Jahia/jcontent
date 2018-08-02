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


export const fileIcon = function(filename){
    switch (filename.split('.').pop().toLowerCase()) {
        case "png":
        case "jpeg":
        case "jpg":
        case "gif":
        case "img": return '<span class="fa fa-file-image-o"></span>';
        case "avi":
        case "mp4":
        case "video": return '<span class="fa fa-file-video-o"></span>';
        case "mp3":
        case "aiff":
        case "sound": return '<span class="fa fa-file-audio-o"></span>';
        case "pdf": return '<span class="fa fa-file-pdf-o" style="color: red;"></span>';
        case "gz":
        case "tgz":
        case "tar.gz":
        case "jar":
        case "rar":
        case "zip": return '<span class="fa fa-file-zip-o" style="color: darkgoldenrod;"></span>';
        case "docx":
        case "doc": return '<span class="fa fa-file-word-o" style="color: mediumblue;"></span>';
        case "xls": return '<span class="fa fa-file-excel-o" style="color: green;"></span>';
        case "pptx":
        case "ppt": return '<span class="fa fa-file-powerpoint-o" style="color: orangered;"></span>';
        case "css":
        case "java":
        case "html": return '<span class="fa fa-file-code-o" style="color: mediumpurple"></span>';
        case "txt":
        case "csv":
        case "text": return '<span class="fa fa-file-text-o"></span>';
        case "folder": return '<span class="fa fa-folder"></span>';
        default: return '<span class="fa fa-file-o"></span>';
    }
};