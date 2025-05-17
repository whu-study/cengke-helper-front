import {myRequest, type TransDef} from "@/api/myAxios.ts";

import {apiPrefix} from "../api/globalConst.ts";

export const webGetProfile = (): Promise<TransDef> => {
    return myRequest({
        method: 'GET',
        url: apiPrefix + '/users/profile'
    });
};