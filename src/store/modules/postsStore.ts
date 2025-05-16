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
    function clearCurrentPost() {
        currentPost.value = null;
    }

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
        currentPost.value = null; // 请求开始前清空，避免旧数据闪烁
    
        // 返回 Promise 链
        return apiGetPostById(postId)
            .then((response: TransDef<Post>) => {
                if (response.code === 0 && response.data) {
                    currentPost.value = response.data; // 关键：确保 response.data 包含最新的用户交互状态"
                    // console.log('currentPost.value', currentPost.value);
                    // console.log('response.data', response.data);
                } else {
                    // 如果 code 不为 0 或 data 为空，则抛出错误，由 .catch() 处理
                    throw new Error(response.msg || `帖子 ID ${postId} 未找到或加载失败`);
                }
            })
            .catch((err: any) => {
                error.value = err.message || '获取帖子详情时发生错误';
                console.error(`Workspace post by ID ${postId} error in store:`, err);
                // 虽然我们在这里处理了错误，但为了符合 Promise<void> 的返回类型，
                // 并且让调用者知道发生了错误（如果它也链接了 .catch()），
                // 我们可以选择再次抛出错误或返回一个被拒绝的 Promise。
                // 但通常，如果 store 内部处理了 UI 相关的错误状态，就不需要再向上抛了。
                // 为了简单起见，这里我们不再次抛出。
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
        const userStore = useUserStore();
        if (!userStore.userInfo.id) {
            ElMessage.error('请先登录后再点赞');
            return Promise.reject(new Error('用户未登录'));
        }

        // 不再检查 currentPost.value 与 postId 是否匹配，允许在列表页直接点赞
        // API 成功后，会尝试更新 currentPost (如果它恰好是这个帖子) 和列表中的帖子

        return new Promise((resolve, reject) => {
            apiToggleLikePost(postId)
                .then((response: TransDef<ToggleLikeResponseData>) => {
                    if (response.code === 0 && response.data) {
                        // 1. 更新 currentPost (如果当前详情页显示的是这个帖子)
                        if (currentPost.value && currentPost.value.id.toString() === postId.toString()) {
                            currentPost.value.isLikedByCurrentUser = response.data.isLiked;
                            currentPost.value.likesCount = response.data.likesCount;
                        }

                        // 2. 更新帖子列表中的对应项 (如果存在)
                        const postInList = posts.value.find(p => p.id.toString() === postId.toString());
                        if (postInList) {
                            postInList.isLikedByCurrentUser = response.data.isLiked;
                            postInList.likesCount = response.data.likesCount;
                            // 为了确保深层对象属性的更改能被Vue检测到以更新列表视图，
                            // 可以考虑替换整个对象或使用Vue.set/this.$set (在Vue2中)
                            // 在Vue3+Setup中，直接修改 ref 对象的属性通常是响应式的。
                            // 如果列表渲染不更新，可以尝试:
                            // const index = posts.value.findIndex(p => p.id.toString() === postId.toString());
                            // if (index !== -1) {
                            //   posts.value[index] = { ...postInList }; // 创建新对象以触发更新
                            // }
                        }
                        // ElMessage.success(response.data.isLiked ? '点赞成功' : '已取消点赞'); // 按钮组件可自行提示
                        resolve(response.data);
                    } else {
                        throw new Error(response.msg || '点赞操作失败');
                    }
                })
                .catch((err: any) => {
                    ElMessage.error(err.message || '点赞操作时发生错误');
                    console.error(`[PostsStore] Toggle like for post ${postId} error:`, err);
                    reject(err); // 将错误传递给调用方 (LikeButton)
                });
        });
    }

    /**
     * 切换帖子收藏状态
     * @param postId - 帖子ID
     */
    function toggleCollectPost(postId: string | number): Promise<ToggleCollectResponseData | null> {
        const userStore = useUserStore();
        if (!userStore.userInfo.id) {
            ElMessage.error('请先登录后再收藏');
            return Promise.reject(new Error('用户未登录'));
        }

        return new Promise((resolve, reject) => {
            apiToggleCollectPost(postId)
                .then((response: TransDef<ToggleCollectResponseData>) => {
                    if (response.code === 0 && response.data) {
                        // 1. 更新 currentPost (如果当前详情页显示的是这个帖子)
                        if (currentPost.value && currentPost.value.id.toString() === postId.toString()) {
                            currentPost.value.isCollectedByCurrentUser = response.data.isCollected;
                            currentPost.value.collectCount = response.data.collectCount;
                        }

                        // 2. 更新帖子列表中的对应项
                        const postInList = posts.value.find(p => p.id.toString() === postId.toString());
                        if (postInList) {
                            postInList.isCollectedByCurrentUser = response.data.isCollected;
                            postInList.collectCount = response.data.collectCount;
                            // const index = posts.value.findIndex(p => p.id.toString() === postId.toString());
                            // if (index !== -1) {
                            //   posts.value[index] = { ...postInList };
                            // }
                        }
                        // ElMessage.success(response.data.isCollected ? '收藏成功' : '已取消收藏');
                        resolve(response.data);
                    } else {
                        throw new Error(response.msg || '收藏操作失败');
                    }
                })
                .catch((err: any) => {
                    ElMessage.error(err.message || '收藏操作时发生错误');
                    console.error(`[PostsStore] Toggle collect for post ${postId} error:`, err);
                    reject(err);
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
        clearCurrentPost,
    };
});
