const _ = require("lodash");
const fs = require("fs")
const path = require("path")
const { isEmpty, generateUniqueFileName, isValidFileType, isValidFileSize } = require("../utils/utils");
const common = require("../statics/static.json");

async function replaceNullWithEmptyString(obj) {
    try {
        // const newObj = _.cloneDeep(obj); // Deep clone the object
        await _.forEach(obj, (value, key, object) => {
            if (value === null) {
                object[key] = "";
            } else if (_.isObject(value)) {
                replaceNullWithEmptyString(value); // Recurse for nested objects
            }
        });
        return obj;
    } catch (error) {
        return obj;
    }
}

// Function for replace NULL value with EMPTY string in given object
exports.replaceNullWithEmptyString = async (obj) => {
    const newObj = replaceNullWithEmptyString(obj);
    return newObj;
};

// Function for img uploading (OLD function which handles single image upload)
exports.imgUploading_single_img = async (imgArr = {}, serviceName, body) => {

    if (isEmpty(imgArr)) { return ""; }
    const resArr = {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
    };
    try {
        for (const [key, imgObj] of Object.entries(imgArr)) {
            const { media, media_type } = imgObj;
            if (!isEmpty(media)) {
                if (!isValidFileType(media.originalFilename, media_type)) {
                    resArr.message = common.response_msg.invalid_file;
                    return resArr;
                }
                if (!isValidFileSize(media.size, media_type)) {
                    resArr.message = common.response_msg.exceeds_file_size;
                    return resArr;
                }
            }
        }
        for (const [key, imgObj] of Object.entries(imgArr)) {
            const { media, upload_path, curr_img } = imgObj;
            if (!isEmpty(media)) {
                // console.log("IMG_UPLOAD_PATH-------->",path.join(__dirname, '../../', serviceName, upload_path))

                const uniqueFilename = generateUniqueFileName(media.originalFilename);
                const oldPath = media.filepath;
                const newPath = path.join(__dirname, '../../', serviceName, upload_path, uniqueFilename);
                const rawData = fs.readFileSync(oldPath);

                try {
                    fs.writeFileSync(newPath, rawData);

                    // Additional handling for img UNLINK code can be added here 
                    if (!isEmpty(curr_img)) {
                        let prev_img_path = path.join(__dirname, '../../', serviceName, upload_path, curr_img);
                        if (fs.existsSync(prev_img_path)) { fs.unlinkSync(prev_img_path); }
                    }

                    // Update the image key (e.g., 'vehicle_img', 'reg_img') in your body object
                    body[key] = uniqueFilename;
                    resArr.type = common.response_type.error;
                    resArr.statusCode = common.response_status_code.success;
                    resArr.message = "Images uploaded";
                } catch (error) {
                    console.error('Error uploading image:', error);
                    resArr.statusCode = common.response_status_code.internal_error;
                    resArr.message = common.response_msg.img_not_uploaded;
                    return resArr;
                }
            }
        }
        return resArr;
    } catch (error) {
        console.error('Error uploading image:', error);
        resArr.statusCode = common.response_status_code.internal_error;
        resArr.message = common.response_msg.img_not_uploaded;
        return resArr;
    }

};

// Function for SINGLE/MULTIPLE img uploading 
exports.imgUploading = async (imgArr = {}, serviceName, body) => {

    if (isEmpty(imgArr)) { return ""; }
    const resArr = { success: common.response_success.false, statusCode: common.response_status_code.bad_request, type: common.response_type.error };
    try {
        for (const [key, imgObj] of Object.entries(imgArr)) {
            const { media, media_type } = imgObj;
            if (media.length > 0) {
                const type_arr = [];
                const size_arr = [];
                await Promise.all(
                    media.map(async (file) => {
                        type_arr.push(file.originalFilename);
                        size_arr.push(file.size);
                    })
                );

                // Validate File Type
                const type_res = isValidFileType(type_arr, media_type);
                if (type_res.length > 0) { resArr.message = common.response_msg.invalid_multi_file; return resArr; }

                // Validate File Size
                const size_res = isValidFileSize(size_arr, media_type);
                if (size_res.length > 0) { resArr.message = common.response_msg.exceeds_multi_file_size; return resArr; }
            }
        }
        for (const [key, imgObj] of Object.entries(imgArr)) {
            const { media, media_type, upload_path, curr_img } = imgObj;
            if (media.length > 0) {

                const uploaderr_arr = [];
                const new_file_arr = [];
                await Promise.all(
                    media.map(async (file) => {
                        // uploaderr_arr.push(file.size);
                        const uniqueFilename = generateUniqueFileName(file.originalFilename);
                        const oldPath = file.filepath;
                        const newPath = path.join(__dirname, '../../', serviceName, upload_path, uniqueFilename);
                        const rawData = fs.readFileSync(oldPath);
                        try {
                            fs.writeFileSync(newPath, rawData);
                            // Update the image key (e.g., 'vehicle_img', 'reg_img') in your body object                        
                            new_file_arr.push(uniqueFilename);
                        } catch (error) {
                            console.error('Error uploading image:', error);
                            uploaderr_arr.push(common.response_status_code.internal_error);
                        }
                    })
                );

                // Additional handling for img UNLINK code can be added here 
                if (!isEmpty(curr_img)) {
                    let curr_img_arr = curr_img.split(",");
                    curr_img_arr.map(async (old_file) => {
                        let prev_img_path = path.join(__dirname, '../../', serviceName, upload_path, old_file);
                        if (fs.existsSync(prev_img_path)) { fs.unlinkSync(prev_img_path); }
                    });
                }

                // console.log("new_file_arr-----", new_file_arr);
                body[key] = new_file_arr.join(",");
                if (uploaderr_arr.length > 0) {
                    resArr.statusCode = common.response_status_code.internal_error;
                    resArr.message = common.response_msg.img_not_uploaded;
                } else {
                    resArr.success = common.response_success.true;
                    resArr.type = common.response_type.success;
                    resArr.statusCode = common.response_status_code.success;
                    resArr.message = "Images uploaded";
                }
            }
        }
        return resArr;
    } catch (error) {
        console.log('error: ', error);
        resArr.success = common.response_success.false;
        resArr.statusCode = common.response_status_code.internal_error;
        resArr.message = common.response_msg.img_not_uploaded;
        return resArr;
    }

};

/*************** NOTE : currently, below function is not in used ***************/
// Function for SINGLE/MULTIPLE img uploading 
exports.imgUploading_BKP = async (imgArr = {}, serviceName, body) => {

    if (isEmpty(imgArr)) { return ""; }
    const resArr = {
        success: common.response_success.false,
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
    };
    for (const [key, imgObj] of Object.entries(imgArr)) {
        const { media, media_type } = imgObj;
        if (media.length > 0) {
            const type_arr = [];
            const size_arr = [];
            await Promise.all(
                media.map(async (file) => {
                    type_arr.push(file.originalFilename);
                    size_arr.push(file.size);
                })
            );

            // Validate File Type
            const type_res = isValidFileType(type_arr, media_type);
            if (type_res.length > 0) { resArr.message = common.response_msg.invalid_multi_file; return resArr; }

            // Validate File Size
            const size_res = isValidFileSize(size_arr, media_type);
            if (size_res.length > 0) { resArr.message = common.response_msg.exceeds_multi_file_size; return resArr; }
        }
    }
    for (const [key, imgObj] of Object.entries(imgArr)) {
        const { media, upload_path, curr_img } = imgObj;
        if (media.length > 0) {
            const uploaderr_arr = [];
            const new_file_arr = [];
            await Promise.all(
                media.map(async (file) => {
                    // uploaderr_arr.push(file.size);
                    const uniqueFilename = generateUniqueFileName(file.originalFilename);
                    const oldPath = file.filepath;
                    const newPath = path.join(__dirname, '../../', serviceName, upload_path, uniqueFilename);
                    const rawData = fs.readFileSync(oldPath);
                    try {
                        fs.writeFileSync(newPath, rawData);
                        // Additional handling for img UNLINK code can be added here 
                        if (!isEmpty(curr_img)) {
                            let curr_img_arr = curr_img.split(",");
                            curr_img_arr.map(async (old_file) => {
                                let prev_img_path = path.join(__dirname, '../../', serviceName, upload_path, old_file);
                                if (fs.existsSync(prev_img_path)) { fs.unlinkSync(prev_img_path); }
                            });
                            // let prev_img_path = path.join(__dirname, '../../', serviceName, upload_path, curr_img);
                            // if (fs.existsSync(prev_img_path)) { fs.unlinkSync(prev_img_path); }
                        }
                        // Update the image key (e.g., 'vehicle_img', 'reg_img') in your body object                        
                        new_file_arr.push(uniqueFilename);
                    } catch (error) {
                        console.error('Error uploading image:', error);
                        uploaderr_arr.push(common.response_status_code.internal_error);
                    }
                })
            );
            console.log("new_file_arr-----", new_file_arr);
            body[key] = new_file_arr.join(",");
            if (uploaderr_arr.length > 0) {
                resArr.statusCode = common.response_status_code.internal_error;
                resArr.message = common.response_msg.img_not_uploaded;
            } else {
                resArr.type = common.response_type.error;
                resArr.statusCode = common.response_status_code.success;
                resArr.message = "Images uploaded";
            }
        }
    }
    return resArr;
};
/*************** NOTE : currently, below function is not in used ***************/