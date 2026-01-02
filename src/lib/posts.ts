// localStorage-based CRUD for posts

export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  image?: string;
  category: string;
  likes: number;
  comments: number;
  timestamp: string;
  likedBy: string[]; // Array of user IDs who liked
}

export interface Comment {
  id: string;
  postId: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
}

const POSTS_KEY = "kily_posts";
const COMMENTS_KEY = "kily_comments";
const POST_LIKES_KEY = "kily_post_likes";

// Initialize with default posts if empty
const getDefaultPosts = (): Post[] => {
  return [
    {
      id: "1",
      author: {
        id: "1",
        name: "Amina Koné",
        username: "@aminakone",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      },
      content: "Je viens de terminer une magnifique pièce montée pour un mariage de 200 personnes ! 🎂✨ La passion de la pâtisserie africaine continue de m'animer chaque jour.",
      image: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800",
      category: "Cuisine",
      likes: 234,
      comments: 45,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      likedBy: [],
    },
    {
      id: "2",
      author: {
        id: "2",
        name: "Kofi Mensah",
        username: "@kofimensah",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      },
      content: "Nouveau projet terminé : Application mobile e-commerce pour une boutique locale. Fier du résultat ! 💻🚀",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
      category: "Tech & Code",
      likes: 189,
      comments: 32,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      likedBy: [],
    },
    {
      id: "3",
      author: {
        id: "3",
        name: "Fatoumata Diallo",
        username: "@fatoudiallo",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
      },
      content: "Séance photo pour une marque de mode africaine. J'adore capturer la beauté de nos créations ! 📸✨",
      category: "Design & Créa",
      likes: 312,
      comments: 67,
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      likedBy: [],
    },
  ];
};

// Load posts from localStorage
export const loadPosts = (): Post[] => {
  if (typeof window === "undefined") return getDefaultPosts();

  const stored = localStorage.getItem(POSTS_KEY);
  if (!stored) {
    // Initialize with default posts
    const defaultPosts = getDefaultPosts();
    localStorage.setItem(POSTS_KEY, JSON.stringify(defaultPosts));
    return defaultPosts;
  }

  return JSON.parse(stored);
};

// Save posts to localStorage
const savePosts = (posts: Post[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
};

// Create new post
export const createPost = (postData: {
  content: string;
  image?: string;
  category: string;
  author: Post["author"];
}): Post => {
  const posts = loadPosts();

  const newPost: Post = {
    id: Date.now().toString(),
    author: postData.author,
    content: postData.content,
    image: postData.image,
    category: postData.category,
    likes: 0,
    comments: 0,
    timestamp: new Date().toISOString(),
    likedBy: [],
  };

  posts.unshift(newPost); // Add to beginning
  savePosts(posts);

  return newPost;
};

// Get post by ID
export const getPostById = (postId: string): Post | null => {
  const posts = loadPosts();
  return posts.find((p) => p.id === postId) || null;
};

// Toggle like on post
export const togglePostLike = (postId: string, userId: string): { liked: boolean; likesCount: number } => {
  const posts = loadPosts();
  const post = posts.find((p) => p.id === postId);

  if (!post) return { liked: false, likesCount: 0 };

  const alreadyLiked = post.likedBy.includes(userId);

  if (alreadyLiked) {
    post.likedBy = post.likedBy.filter((id) => id !== userId);
    post.likes = Math.max(0, post.likes - 1);
  } else {
    post.likedBy.push(userId);
    post.likes += 1;
  }

  savePosts(posts);

  return {
    liked: !alreadyLiked,
    likesCount: post.likes,
  };
};

// Check if user liked post
export const isPostLiked = (postId: string, userId: string): boolean => {
  const post = getPostById(postId);
  return post ? post.likedBy.includes(userId) : false;
};

// Delete post
export const deletePost = (postId: string): boolean => {
  const posts = loadPosts();
  const filteredPosts = posts.filter((p) => p.id !== postId);

  if (filteredPosts.length === posts.length) return false;

  savePosts(filteredPosts);
  return true;
};

// ---------- COMMENTS ----------

// Load comments from localStorage
export const loadComments = (postId?: string): Comment[] => {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(COMMENTS_KEY);
  const allComments: Comment[] = stored ? JSON.parse(stored) : [];

  if (postId) {
    return allComments.filter((c) => c.postId === postId);
  }

  return allComments;
};

// Save comments to localStorage
const saveComments = (comments: Comment[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
};

// Add comment to post
export const addComment = (
  postId: string,
  content: string,
  author: { name: string; username: string; avatar: string }
): Comment => {
  const allComments = loadComments();
  const posts = loadPosts();

  const newComment: Comment = {
    id: Date.now().toString(),
    postId,
    author,
    content,
    timestamp: new Date().toISOString(),
    likes: 0,
  };

  allComments.push(newComment);
  saveComments(allComments);

  // Update comment count on post
  const post = posts.find((p) => p.id === postId);
  if (post) {
    post.comments += 1;
    savePosts(posts);
  }

  return newComment;
};

// Get comments count for post
export const getCommentsCount = (postId: string): number => {
  const comments = loadComments(postId);
  return comments.length;
};

// Delete comment
export const deleteComment = (commentId: string): boolean => {
  const allComments = loadComments();
  const comment = allComments.find((c) => c.id === commentId);

  if (!comment) return false;

  const filteredComments = allComments.filter((c) => c.id !== commentId);
  saveComments(filteredComments);

  // Update comment count on post
  const posts = loadPosts();
  const post = posts.find((p) => p.id === comment.postId);
  if (post) {
    post.comments = Math.max(0, post.comments - 1);
    savePosts(posts);
  }

  return true;
};
