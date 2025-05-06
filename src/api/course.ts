import {myRequest, type TransDef} from "@/api/myAxios.ts";

import {apiPrefix} from "../api/globalConst.ts";

    export const getCourseList = (): Promise<TransDef> => {
        return myRequest({
            method: 'GET',
            url: apiPrefix + '/courses'
        })
    }