// src/store/modules/postsStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Post } from '@/types/discuss'; // 导入帖子类型
import { ElMessage } from 'element-plus'; // 引入 Element Plus 消息提示

// 导入 API 服务函数
import {
    apiGetPosts,
    apiGetPostById,
    apiCreatePost,
    apiUpdatePost,
    apiDeletePost,
    apiToggleLikePost,
    apiToggleCollectPost,
    type GetPostsParams,
    type CreatePostBody,
    type UpdatePostBody,
    type GetPostsResponseData, // 确保导入此类型
    type ToggleLikeResponseData, // 确保导入此类型
    type ToggleCollectResponseData, // 确保导入此类型
} from '@/api/postService'; // 假设 API 服务文件路径
import { useUserStore } from './userStore'; // 用于获取当前用户ID (如果需要)
import type { TransDef } from '@/api/myAxios'; // 导入 TransDef 类型

export const usePostsStore = defineStore('posts', () => {
    // --- State ---
    const posts = ref<Post[]>([]); // 帖子列表
    const currentPost = ref<Post | null>(null); // 当前查看的单个帖子详情
    const isLoading = ref(false); // 加载状态
    const error = ref<string | null>(null); // 错误信息
    const pagination = ref({ // 分页信息
        currentPage: 1,
        pageSize: 10, // 默认每页数量
        totalPosts: 0,
    });

    // --- Getters ---
    /**
     * 根据ID从当前已加载的帖子列表中获取帖子
     */
    const getPostByIdFromState = computed(() => {
        return (id: string | number) => posts.value.find(post => post.id.toString() === id.toString());
    });

    // --- Actions ---
    /**
     * 获取帖子列表
     */
    function fetchPosts(params: GetPostsParams = {}): Promise<void> {
        isLoading.value = true;
        error.value = null;
        const pageToFetch = params.page || pagination.value.currentPage;
        const limitToFetch = params.limit || pagination.value.pageSize;

        return apiGetPosts({ ...params, page: pageToFetch, limit: limitToFetch })
            .then((response: TransDef<GetPostsResponseData>) => { // 显式指定 response 类型
                if (response.code === 0 && response.data) {
                    posts.value = response.data.items;
                    pagination.value.totalPosts = response.data.total;
                    pagination.value.currentPage = pageToFetch;
                    // pagination.value.pageSize = response.data.pageSize || limitToFetch; // 如果后端返回pageSize
                } else {
                    throw new Error(response.msg || '获取帖子列表失败');
                }
            })
            .catch((err: any) => {
                error.value = err.message || '获取帖子列表时发生错误';
                console.error('Fetch posts error:', err);
                // ElMessage.error(error.value); // 可以在组件层面处理，或在此处统一处理
            })
            .finally(() => {
                isLoading.value = false;
            });
    }

    /**
     * 根据ID获取单个帖子详情
     */
    function fetchPostById(postId: string | number): Promise<void> {
        isLoading.value = true;
        error.value = null;
        currentPost.value = null;
        return apiGetPostById(postId)
            .then((response: TransDef<Post>) => {
                if (response.code === 0 && response.data) {
                    currentPost.value = response.data;
                } else {
                    throw new Error(response.msg || `帖子 ID ${postId} 未找到`);
                }
            })
            .catch((err: any) => {
                error.value = err.message || '获取帖子详情时发生错误';
                console.error(`Fetch post by ID ${postId} error:`, err);
            })
            .finally(() => {
                isLoading.value = false;
            });
    }

    /**
     * 创建新帖子
     * @param postData - 包含 title, content, tags 等的帖子数据
     */
    function createPost(postData: CreatePostBody): Promise<Post | null> {
        // const userStore = useUserStore();
        // if (!userStore.currentUser?.id) {
        //     ElMessage.error('用户未登录，无法创建帖子');
        //     return Promise.resolve(null); // 返回一个解析为 null 的 Promise
        // }
        isLoading.value = true;
        error.value = null;
        return new Promise((resolve, reject) => {
            apiCreatePost(postData)
                .then((response: TransDef<Post>) => {
                    if (response.code === 0 && response.data) {
                        ElMessage.success('帖子创建成功！');
                        // 创建成功后刷新列表并回到第一页
                        fetchPosts({ page: 1, limit: pagination.value.pageSize })
                            .then(() => resolve(response.data)) // 返回创建的帖子
                            .catch(fetchErr => {
                                console.error("Error fetching posts after creation:", fetchErr);
                                // 即使列表刷新失败，帖子本身已创建成功
                                resolve(response.data);
                            });
                    } else {
                        throw new Error(response.msg || '创建帖子失败');
                    }
                })
                .catch((err: any) => {
                    error.value = err.message || '创建帖子时发生错误';
                    ElMessage.error(error.value as string);
                    console.error('Create post error:', err);
                    reject(err); // 或者 resolve(null)
                })
                .finally(() => {
                    isLoading.value = false;
                });
        });
    }

    /**
     * 更新帖子
     * @param postId - 要更新的帖子ID
     * @param postData - 要更新的帖子数据
     */
    function updatePost(postId: string | number, postData: UpdatePostBody): Promise<Post | null> {
        isLoading.value = true;
        error.value = null;
        return new Promise((resolve, reject) => {
            apiUpdatePost(postId, postData)
                .then((response: TransDef<Post>) => {
                    if (response.code === 0 && response.data) {
                        ElMessage.success('帖子更新成功！');
                        const updatedPostData = response.data;
                        if (currentPost.value && currentPost.value.id.toString() === postId.toString()) {
                            currentPost.value = { ...currentPost.value, ...updatedPostData };
                        }
                        const index = posts.value.findIndex(p => p.id.toString() === postId.toString());
                        if (index !== -1) {
                            posts.value[index] = { ...posts.value[index], ...updatedPostData };
                        }
                        resolve(updatedPostData);
                    } else {
                        throw new Error(response.msg || '更新帖子失败');
                    }
                })
                .catch((err: any) => {
                    error.value = err.message || '更新帖子时发生错误';
                    ElMessage.error(error.value as string);
                    console.error(`Update post ${postId} error:`, err);
                    reject(err);
                })
                .finally(() => {
                    isLoading.value = false;
                });
        });
    }

    /**
     * 删除帖子
     * @param postId - 要删除的帖子ID
     */
    function deletePost(postId: string | number): Promise<boolean> {
        isLoading.value = true;
        error.value = null;
        return new Promise((resolve, reject) => {
            apiDeletePost(postId)
                .then((response: TransDef<null>) => {
                    if (response.code === 0) {
                        ElMessage.success('帖子删除成功！');
                        posts.value = posts.value.filter(p => p.id.toString() !== postId.toString());
                        if (currentPost.value && currentPost.value.id.toString() === postId.toString()) {
                            currentPost.value = null;
                        }
                        pagination.value.totalPosts = Math.max(0, pagination.value.totalPosts - 1);
                        if (posts.value.length === 0 && pagination.value.currentPage > 1) {
                            // 如果删除后当前页为空，则获取前一页
                            return fetchPosts({ page: pagination.value.currentPage - 1, limit: pagination.value.pageSize });
                        }
                        return Promise.resolve(); // 如果不需要重新获取，则解析
                    } else {
                        throw new Error(response.msg || '删除帖子失败');
                    }
                })
                .then(() => { // 这个 .then() 是为了处理 fetchPosts 可能返回的 Promise
                    resolve(true);
                })
                .catch((err: any) => {
                    error.value = err.message || '删除帖子时发生错误';
                    ElMessage.error(error.value as string);
                    console.error(`Delete post ${postId} error:`, err);
                    reject(err); // 或者 resolve(false)
                })
                .finally(() => {
                    isLoading.value = false;
                });
        });
    }

    /**
     * 切换帖子点赞状态
     * @param postId - 帖子ID
     */
    function toggleLikePost(postId: string | number): Promise<ToggleLikeResponseData | null> {
        // isLoading 状态通常由 LikeButton 组件自身管理，这里不设置全局 isLoading
        return new Promise((resolve, reject) => {
            apiToggleLikePost(postId)
                .then((response: TransDef<ToggleLikeResponseData>) => {
                    if (response.code === 0 && response.data) {
                        const updateTargetPost = (postToUpdate: Post | null) => {
                            if (postToUpdate && postToUpdate.id.toString() === postId.toString()) {
                                // 假设 Post 类型有 isLikedByCurrentUser 字段
                                // (postToUpdate as any).isLikedByCurrentUser = response.data.isLiked;
                                // 确保 Post 类型定义中包含 isLikedByCurrentUser
                                if ('isLikedByCurrentUser' in postToUpdate) {
                                    postToUpdate.isLikedByCurrentUser = response.data.isLiked;
                                }
                                postToUpdate.likesCount = response.data.likesCount;
                            }
                        };
                        updateTargetPost(currentPost.value);
                        const postInList = posts.value.find(p => p.id.toString() === postId.toString());
                        if (postInList) {
                            updateTargetPost(postInList);
                            // 手动触发列表更新，如果深层对象属性变化 Vue 可能无法检测
                            // posts.value = [...posts.value];
                        }
                        resolve(response.data);
                    } else {
                        throw new Error(response.msg || '点赞操作失败');
                    }
                })
                .catch((err: any) => {
                    ElMessage.error(err.message || '点赞操作时发生错误');
                    console.error(`Toggle like for post ${postId} error:`, err);
                    reject(err);
                });
        });
    }
    /** ★ 新增：切换帖子收藏状态 (Toggle post collect status)
     * @param postId - 帖子ID (Post ID)
     */
    function toggleCollectPost(postId: string | number): Promise<ToggleCollectResponseData | null> {
        // 通常收藏操作的 isLoading 也可以由按钮自身管理
        // 如果需要全局加载状态，可以在这里设置 this.isLoading = true; 和 finally 中 false
        return new Promise((resolve, reject) => {
            apiToggleCollectPost(postId) // 假设 apiToggleCollectPost 不需要 currentUserId，后端从 token 获取
                .then((response: TransDef<ToggleCollectResponseData>) => {
                    if (response.code === 0 && response.data) {
                        // 更新帖子列表或当前帖子中的收藏信息
                        const updateTargetPostCollection = (postToUpdate: Post | null) => {
                            if (postToUpdate && postToUpdate.id.toString() === postId.toString()) {
                                // 确保 Post 类型定义中有 isFavoritedByCurrentUser (或者您用的 isCollected)
                                // 以及 collectCount (如果后端返回)
                                if ('isCollectedByCurrentUser' in postToUpdate) { // 假设您 Post 类型中用的是 isFavoritedByCurrentUser
                                    postToUpdate.isCollectedByCurrentUser = response.data.isCollected;
                                }
                                if ('collectCount' in postToUpdate) {
                                   postToUpdate.collectCount = response.data.collectCount;
                                }
                                // 如果后端不返回总收藏数，或者前端不直接显示，可以只更新 isCollected 状态
                            }
                        };

                        updateTargetPostCollection(currentPost.value);
                        const postInList = posts.value.find(p => p.id.toString() === postId.toString());
                        if (postInList) {
                            updateTargetPostCollection(postInList);
                            // 如果 posts 数组的深层更新没有触发视图更新，可以考虑:
                            // posts.value = [...posts.value];
                        }
                        resolve(response.data); // 返回 { isCollected, collectCount }
                    } else {
                        throw new Error(response.msg || '收藏操作失败');
                    }
                })
                .catch((err: any) => {
                    ElMessage.error(err.message || '收藏操作时发生错误');
                    console.error(`Toggle collect for post ${postId} error:`, err);
                    reject(err); // 让调用方也能捕获
                });
        });
    }
    return {
        posts,
        currentPost,
        isLoading,
        error,
        pagination,
        getPostByIdFromState,
        fetchPosts,
        fetchPostById,
        createPost,
        updatePost,
        deletePost,
        toggleLikePost,
        toggleCollectPost,
    };
});
