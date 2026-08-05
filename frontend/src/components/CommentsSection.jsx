import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import commentService from '../services/commentService';
import { getRelativeTime } from '../utils/timeUtils';
import { useAuth } from '../contexts/AuthContext';
import Avatar from './Avatar';
import DeleteConfirmModal from './DeleteConfirmModal';

export default function CommentsSection({ experienceId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New comment state
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Edit state
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Upvotes state (local interactive state per comment)
  const [likedComments, setLikedComments] = useState({});

  // Reply active state
  const [replyingCommentId, setReplyingCommentId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Delete state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (experienceId) {
      fetchComments();
    }
  }, [experienceId]);

  // Handle Escape key to close reply box
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && replyingCommentId) {
        setReplyingCommentId(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [replyingCommentId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await commentService.getComments(experienceId);
      // Ensure descending order (newest first)
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setComments(sortedData);
    } catch (err) {
      console.error('[CommentsSection] Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsPosting(true);
      const createdComment = await commentService.createComment(experienceId, newComment.trim());
      setComments((prev) => [createdComment, ...prev]);
      setNewComment('');
      toast.success('Comment posted');
    } catch (err) {
      console.error('[CommentsSection] Error posting comment:', err);
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setIsPosting(false);
    }
  };

  const toggleCommentLike = (commentId) => {
    setLikedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const handleSendReply = async (parentCommentId) => {
    if (!replyText.trim()) return;

    try {
      setIsPosting(true);
      await commentService.replyToComment(parentCommentId, replyText.trim());
      setReplyText('');
      setReplyingCommentId(null);
      fetchComments();
      toast.success('Reply posted');
    } catch (err) {
      console.error('[CommentsSection] Error posting reply:', err);
      toast.error(err.response?.data?.message || 'Failed to post reply');
    } finally {
      setIsPosting(false);
    }
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      setIsSavingEdit(true);
      const updatedComment = await commentService.updateComment(commentId, editContent.trim());
      setComments((prev) => 
        prev.map((c) => (c.id === commentId ? { ...c, content: updatedComment.content, updatedAt: updatedComment.updatedAt } : c))
      );
      setEditingCommentId(null);
      setEditContent('');
      toast.success('Comment updated');
    } catch (err) {
      console.error('[CommentsSection] Error updating comment:', err);
      toast.error(err.response?.data?.message || 'Failed to update comment');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const confirmDelete = (comment) => {
    setCommentToDelete(comment);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!commentToDelete) return;

    try {
      setIsDeleting(true);
      await commentService.deleteComment(commentToDelete.id);
      setComments((prev) => prev.filter((c) => c.id !== commentToDelete.id));
      toast.success('Comment deleted');
      setDeleteModalOpen(false);
      setCommentToDelete(null);
    } catch (err) {
      console.error('[CommentsSection] Error deleting comment:', err);
      toast.error(err.response?.data?.message || 'Failed to delete comment');
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwner = (commentUserId) => {
    return user && (user.id === commentUserId);
  };

  return (
    <div className="flex flex-col gap-6 mt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2 text-theme-text">
          <iconify-icon icon="lucide:message-square" className="text-theme-muted text-lg"></iconify-icon>
          Discussion & Comments
          {!loading && (
            <span className="text-xs font-bold text-theme-muted bg-theme-hover border border-theme-border px-2.5 py-0.5 rounded-sm ml-1">
              {comments.length}
            </span>
          )}
        </h2>
      </div>

      {/* Add Comment Field */}
      {user ? (
        <form onSubmit={handlePostComment} className="premium-card p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <Avatar 
              seed={user?.avatarSeed} 
              name={user?.name} 
              size="w-10 h-10 mt-1 flex-shrink-0" 
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts, ask questions, or provide feedback..."
                className="w-full bg-theme-main border border-theme-border rounded-sm p-4 text-sm text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-theme-border-inverted transition-colors min-h-[100px] resize-y shadow-inner"
                disabled={isPosting}
              />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-theme-border pt-3">
            <span className="text-xs text-theme-muted hidden sm:inline-block">Be respectful and constructive in comments.</span>
            <button
              type="submit"
              disabled={isPosting || !newComment.trim()}
              className="flex items-center gap-2 px-6 py-2 rounded-sm bg-theme-inverted text-theme-inverted-text font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ml-auto"
            >
              {isPosting ? 'Posting...' : 'Post Comment'}
              <iconify-icon icon="lucide:send" className="text-sm"></iconify-icon>
            </button>
          </div>
        </form>
      ) : (
        <div className="premium-card py-6 px-4 flex items-center justify-center shadow-sm">
          <p className="text-sm text-theme-muted">
            <a href="#/signin" className="text-theme-text font-bold hover:underline">Sign in</a> to join the conversation.
          </p>
        </div>
      )}

      {/* Subtle Section Divider */}
      <div className="relative py-2 flex items-center justify-center">
        <div className="w-full border-t border-theme-border/60"></div>
        <span className="absolute bg-theme-main px-3 text-[11px] font-bold uppercase tracking-wider text-theme-muted">
          {comments.length > 0 ? `${comments.length} ${comments.length === 1 ? 'Comment' : 'Comments'}` : 'Conversation'}
        </span>
      </div>

      {/* Comments List */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="premium-card animate-pulse flex flex-col gap-4">
            <div className="h-4 bg-theme-border rounded w-1/4"></div>
            <div className="h-4 bg-theme-border rounded w-full"></div>
            <div className="h-4 bg-theme-border rounded w-2/3"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="bg-theme-card py-12 flex flex-col items-center justify-center gap-2 border border-dashed border-theme-border rounded-sm bg-theme-hover/30">
            <iconify-icon icon="lucide:message-circle" className="text-4xl text-theme-muted/50"></iconify-icon>
            <p className="font-bold text-theme-text mt-2">No comments yet.</p>
            <p className="text-xs text-theme-muted">Be the first to start the discussion.</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isLiked = !!likedComments[comment.id];
            const isReplying = replyingCommentId === comment.id;
            const seedToUse = comment.authorAvatarSeed || comment.avatarSeed;

            return (
              <div 
                key={comment.id} 
                className="premium-card p-5 group transition-all duration-200 hover:shadow-md hover:border-theme-border/80"
              >
                <div className="flex items-start gap-4">
                  <Avatar 
                    seed={seedToUse} 
                    name={comment.authorName} 
                    size="w-10 h-10 mt-0.5 flex-shrink-0 cursor-pointer hover:opacity-85 transition-opacity" 
                    onClick={() => { if (comment.userId) window.location.hash = `#/users/${comment.userId}`; }}
                  />
                  
                  <div className="flex-1 flex flex-col gap-2 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-sm font-bold text-theme-text cursor-pointer hover:underline"
                          onClick={() => { if (comment.userId) window.location.hash = `#/users/${comment.userId}`; }}
                        >
                          {comment.authorName || 'User'}
                        </span>
                        <span className="text-xs text-theme-muted">
                          &bull; {getRelativeTime(comment.createdAt)}
                          {comment.updatedAt && comment.updatedAt !== comment.createdAt && ' (edited)'}
                        </span>
                      </div>

                      {isOwner(comment.userId) && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => startEditing(comment)}
                            className="w-7 h-7 rounded-sm flex items-center justify-center text-theme-muted hover:text-theme-text hover:bg-theme-hover transition-colors"
                            title="Edit comment"
                          >
                            <iconify-icon icon="lucide:pencil" className="text-xs"></iconify-icon>
                          </button>
                          <button 
                            onClick={() => confirmDelete(comment)}
                            className="w-7 h-7 rounded-sm flex items-center justify-center text-theme-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Delete comment"
                          >
                            <iconify-icon icon="lucide:trash-2" className="text-xs"></iconify-icon>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    {editingCommentId === comment.id ? (
                      <div className="flex flex-col gap-3 mt-1">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full bg-theme-main border border-theme-border rounded-sm p-3 text-sm text-theme-text focus:outline-none focus:border-theme-border-inverted transition-colors min-h-[80px] resize-y"
                          disabled={isSavingEdit}
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={cancelEditing}
                            disabled={isSavingEdit}
                            className="px-4 py-1.5 rounded-sm text-xs font-bold text-theme-muted hover:text-theme-text hover:bg-theme-hover transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(comment.id)}
                            disabled={isSavingEdit || !editContent.trim()}
                            className="px-4 py-1.5 rounded-sm bg-theme-inverted text-theme-inverted-text text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            {isSavingEdit ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-theme-text leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    )}

                    {/* Footer Actions: Upvote & Reply */}
                    <div className="flex items-center gap-4 mt-1 pt-2 border-t border-theme-border/40">
                      <button
                        onClick={() => toggleCommentLike(comment.id)}
                        className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                          isLiked ? 'text-red-500' : 'text-theme-muted hover:text-theme-text'
                        }`}
                      >
                        <iconify-icon 
                          icon={isLiked ? "lucide:heart" : "lucide:heart"} 
                          className={`text-sm ${isLiked ? 'fill-current' : ''}`}
                        ></iconify-icon>
                        <span>{isLiked ? 1 : 0} Helpful</span>
                      </button>

                      {user && (
                        <button
                          onClick={() => {
                            setReplyingCommentId(isReplying ? null : comment.id);
                            setReplyText('');
                          }}
                          className="flex items-center gap-1.5 text-xs font-bold text-theme-muted hover:text-theme-text transition-colors cursor-pointer"
                        >
                          <iconify-icon icon="lucide:reply" className="text-sm"></iconify-icon>
                          <span>Reply</span>
                        </button>
                      )}
                    </div>

                    {/* Inline Reply Form */}
                    {isReplying && (
                      <div className="flex flex-col gap-2 mt-3 p-3 bg-theme-hover border border-theme-border rounded-sm">
                        <textarea
                          autoFocus
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Replying to @${comment.authorName}...`}
                          className="w-full bg-theme-main border border-theme-border rounded-sm p-2.5 text-xs text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-theme-border-inverted min-h-[60px] resize-y"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setReplyingCommentId(null)}
                            className="px-3 py-1 text-xs font-bold text-theme-muted hover:text-theme-text"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendReply(comment.id)}
                            disabled={!replyText.trim() || isPosting}
                            className="px-4 py-1 rounded-sm bg-theme-inverted text-theme-inverted-text text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                          >
                            {isPosting && isReplying ? 'Replying...' : 'Reply'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Render Replies */}
                    {comment.replyCount > 0 && comment.replies && (
                      <div className="mt-4 flex flex-col gap-3">
                        <div className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-1">
                          {comment.replyCount} {comment.replyCount === 1 ? 'Reply' : 'Replies'}
                        </div>
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-3 pl-2 sm:pl-4 border-l-2 border-theme-border/60">
                            <Avatar
                              seed={reply.authorAvatarSeed || reply.avatarSeed}
                              name={reply.authorName}
                              size="w-8 h-8 flex-shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                              onClick={() => { if (reply.userId) window.location.hash = `#/users/${reply.userId}`; }}
                            />
                            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className="text-sm font-bold text-theme-text cursor-pointer hover:underline"
                                  onClick={() => { if (reply.userId) window.location.hash = `#/users/${reply.userId}`; }}
                                >
                                  {reply.authorName || 'User'}
                                </span>
                                <span className="text-xs text-theme-muted">
                                  &bull; {getRelativeTime(reply.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-theme-text leading-relaxed whitespace-pre-wrap">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <DeleteConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
      />
    </div>
  );
}
