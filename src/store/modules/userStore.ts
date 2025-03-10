import {ref} from "vue";
import {defineStore} from "pinia";
import {StarRecord, User} from "@/types/treeHole.ts";
import {defaultAvatar, defaultUsername} from "@/api/globalConst.ts";
import {webGetProfileStars} from "@/api/star.ts";

export const useUserStore
    = defineStore('user', () => {
    const userUpvoteList = ref<number[]>([])

    function checkIfUpvote(id: number): boolean {
        return userUpvoteList.value.includes(id)
    }

    function cancelUpvote(id: number) {
        const index = userUpvoteList.value.indexOf(id)
        if (index !== -1) {
            userUpvoteList.value.splice(index, 1)
        }
        return
    }

    function upvote(id: number) {
        userUpvoteList.value.push(id)
    }

    function initUpvoteList() {
        webGetProfileStars().then(r => {
            const data = r.data as StarRecord[]
            userUpvoteList.value.length = 0
            for (let i = 0; i < data.length; i++) {
                userUpvoteList.value.push(data[i].postId)
            }
        })
    }


    // 用户信息
    const userInfos = ref<User[]>([{
        avatar: defaultAvatar, id: 1, username: defaultUsername
    }])

    const curUser =
        ref<User>(userInfos.value[0])

    return {
        initUpvoteList,
        userUpvoteList,
        checkIfUpvote,
        cancelUpvote,
        upvote,

        userInfos,
        curUser
    }
})