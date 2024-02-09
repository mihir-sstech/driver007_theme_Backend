exports.diffChecker = (obj1, obj2, keyArray = []) => {
    const result = {}
    const data = []
    data['oldData'] = []
    data['newData'] = []
   

    if (Object.is(obj1, obj2)) {
        return undefined;
    }
    if (!obj2 || typeof obj2 !== 'object') {
        return obj2;
    }
    Object.keys(obj1 || {}).concat(Object.keys(obj2 || {})).forEach(key => {
        if(obj2[key] !== obj1[key] && !Object.is(obj1[key], obj2[key])) {
            if(keyArray.includes(key)){

                data['oldData'].push({
                    [key]: obj1[key]
                })
                
                data['newData'].push({
                    [key]: obj2[key]
                })

                result[key] = {
                    'old': obj1[key],
                    'new': obj2[key]
                }
            }
        }
        // if(typeof obj2[key] === 'object' && typeof obj1[key] === 'object') {
        //     const value = diffChecker(obj1[key], obj2[key]);
        //     if (value !== undefined) {
        //         if(keyArray.includes(key)){

        //             data['oldData'].push({
        //                 [key]: obj1[key]
        //             })
                    
        //             data['newData'].push({
        //                 [key]: obj2[key]
        //             })

        //             result[key] = {
        //                 'old': obj1[key],
        //                 'new': obj2[key]
        //             }
        //         }
        //     }
        // }
    });
    
    return data;
}
