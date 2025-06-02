import {myRequest} from "@/api/myAxios.ts";

import {apiPrefix} from "../api/globalConst.ts";
import type {TransDef} from "@/api/type.ts";

export const webGetProfile = (): Promise<TransDef> => {
    return myRequest({
        method: 'GET',
        url: apiPrefix + '/users/profile'
    });
};