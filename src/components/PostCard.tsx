import type { Post } from '../types';

import { useApp } from '../context/AppContext';

import { formatTime, getCommentSticker } from '../constants';

import PetAvatar from './PetAvatar';

import CommentPicker from './CommentPicker';

import { useState } from 'react';

import './PostCard.css';

import './CommentPicker.css';



const MAX_STICKERS = 3;



interface PostCardProps {

  post: Post;

  showComments?: boolean;

}



function CommentContent({ content, emoji, stickers }: { content: string; emoji?: string; stickers?: string[] }) {

  return (

    <div className="post-card__comment-body">

      {stickers?.map(id => {

        const sticker = getCommentSticker(id);

        if (!sticker) return null;

        return (

          <span key={id} className="comment-sticker" title={sticker.label}>

            <span className="comment-sticker__emoji">{sticker.emoji}</span>

            <span className="comment-sticker__label">{sticker.label}</span>

          </span>

        );

      })}

      {emoji && <span>{emoji}</span>}

      {content && content !== emoji && <span>{content}</span>}

    </div>

  );

}



export default function PostCard({ post, showComments = true }: PostCardProps) {

  const { currentUser, getUser, dispatch } = useApp();

  const author = getUser(post.authorId);

  const [commentText, setCommentText] = useState('');

  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);

  const [expanded, setExpanded] = useState(false);



  if (!author || !currentUser) return null;



  const liked = post.likes.includes(currentUser.id);

  const outfitEmoji = author.equippedOutfit

    ? { hat1: '🎩', hat2: '🎀', scarf: '🧣', glasses: '👓', crown: '👑' }[author.equippedOutfit]

    : null;



  const handleLike = () => {

    dispatch({ type: 'LIKE_POST', postId: post.id, userId: currentUser.id });

  };



  const handleEmojiPick = (emoji: string) => {

    setCommentText(prev => prev + emoji);

  };



  const handleStickerToggle = (stickerId: string) => {

    setSelectedStickers(prev => {

      if (prev.includes(stickerId)) {

        return prev.filter(id => id !== stickerId);

      }

      if (prev.length >= MAX_STICKERS) return prev;

      return [...prev, stickerId];

    });

  };



  const handleRemoveSticker = (stickerId: string) => {

    setSelectedStickers(prev => prev.filter(id => id !== stickerId));

  };



  const handleComment = () => {

    const text = commentText.trim();

    if (!text && selectedStickers.length === 0) return;

    dispatch({

      type: 'ADD_COMMENT',

      postId: post.id,

      comment: {

        authorId: currentUser.id,

        content: text,

        stickers: selectedStickers.length > 0 ? selectedStickers : undefined,

      },

    });

    setCommentText('');

    setSelectedStickers([]);

  };



  const handleDelete = () => {

    if (!confirm('确定要删除这条动态吗？删除后无法恢复。')) return;

    dispatch({ type: 'DELETE_POST', postId: post.id, userId: currentUser.id });

  };



  const isOwnPost = post.authorId === currentUser.id;

  const canSend = commentText.trim().length > 0 || selectedStickers.length > 0;



  return (

    <article className="post-card sketch-box">

      <header className="post-card__header">

        <PetAvatar petType={author.petType} size="md" outfit={outfitEmoji} />

        <div className="post-card__meta">

          <span className="post-card__name">{author.nickname}</span>

          <span className="post-card__pet">的 {author.petName}</span>

          <time className="post-card__time">{formatTime(post.createdAt)}</time>

        </div>

        {post.visibility !== 'public' && (

          <span className="post-card__visibility">

            {post.visibility === 'friends' ? '👥' : '🔒'}

          </span>

        )}

        {isOwnPost && (

          <button className="post-card__delete" onClick={handleDelete} title="删除动态">

            🗑️

          </button>

        )}

      </header>



      <p className="post-card__content">{post.content}</p>



      {post.imageUrl && (

        <div className="post-card__image">

          <img src={post.imageUrl} alt="动态图片" />

        </div>

      )}



      <div className="post-card__actions">

        <button

          className={`post-card__action${liked ? ' post-card__action--active' : ''}`}

          onClick={handleLike}

        >

          {liked ? '❤️' : '🤍'} {post.likes.length || '赞'}

        </button>

        <button className="post-card__action" onClick={() => setExpanded(!expanded)}>

          💬 {post.comments.length || '评论'}

        </button>

      </div>



      {showComments && post.comments.length > 0 && (

        <div className="post-card__comments">

          {post.comments.map(c => {

            const commenter = getUser(c.authorId);

            if (!commenter) return null;

            return (

              <div key={c.id} className="post-card__comment">

                <PetAvatar petType={commenter.petType} size="sm" />

                <div>

                  <strong>{commenter.nickname}</strong>

                  <CommentContent content={c.content} emoji={c.emoji} stickers={c.stickers} />

                </div>

              </div>

            );

          })}

        </div>

      )}



      {showComments && expanded && (

        <div className="post-card__comment-form">

          <CommentPicker

            selectedStickers={selectedStickers}

            onEmojiPick={handleEmojiPick}

            onStickerToggle={handleStickerToggle}

          />



          {selectedStickers.length > 0 && (

            <div className="post-card__comment-preview">

              {selectedStickers.map(id => {

                const sticker = getCommentSticker(id);

                if (!sticker) return null;

                return (

                  <div key={id} className="post-card__preview-sticker">

                    <span className="comment-sticker">

                      <span className="comment-sticker__emoji">{sticker.emoji}</span>

                      <span className="comment-sticker__label">{sticker.label}</span>

                    </span>

                    <button

                      type="button"

                      className="post-card__preview-remove"

                      onClick={() => handleRemoveSticker(id)}

                      title="移除"

                    >

                      ✕

                    </button>

                  </div>

                );

              })}

            </div>

          )}



          <div className="post-card__input-row">

            <input

              value={commentText}

              onChange={e => setCommentText(e.target.value)}

              placeholder="说点什么，搭配表情和表情包..."

              onKeyDown={e => e.key === 'Enter' && handleComment()}

            />

            <button className="btn btn--small" onClick={handleComment} disabled={!canSend}>

              发送

            </button>

          </div>

        </div>

      )}

    </article>

  );

}


