const express = require('express');
const { body } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();
router.use(auth);

const textRule = body('text').trim().isLength({ min: 1, max: 500 }).withMessage('Text must be 1 to 500 characters');
const notFound = (res) => res.status(404).json({ message: 'Post not found' });

router.get('/', asyncHandler(async (req, res) => res.json(await Post.find().sort({ date: -1 }))));

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    return post ? res.json(post) : notFound(res);
  }),
);

router.post(
  '/',
  [textRule],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: 'Account no longer exists' });
    const post = await Post.create({ user: user.id, text: req.body.text, name: user.name, avatar: user.avatar });
    res.status(201).json(post);
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) return notFound(res);
    if (post.user.toString() !== req.userId) return res.status(403).json({ message: 'You can only delete your own posts' });
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  }),
);

// Likes use a single conditional update, so a double click can never add two likes.
router.put(
  '/like/:id',
  asyncHandler(async (req, res) => {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, 'likes.user': { $ne: req.userId } },
      { $push: { likes: { user: req.userId } } },
      { new: true },
    );
    if (post) return res.json(post.likes);
    return (await Post.exists({ _id: req.params.id })) ? res.status(400).json({ message: 'Post already liked' }) : notFound(res);
  }),
);

router.put(
  '/unlike/:id',
  asyncHandler(async (req, res) => {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, 'likes.user': req.userId },
      { $pull: { likes: { user: req.userId } } },
      { new: true },
    );
    if (post) return res.json(post.likes);
    return (await Post.exists({ _id: req.params.id })) ? res.status(400).json({ message: 'Post has not been liked yet' }) : notFound(res);
  }),
);

router.post(
  '/comment/:id',
  [textRule],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: 'Account no longer exists' });
    const comment = { user: user.id, text: req.body.text, name: user.name, avatar: user.avatar };
    const post = await Post.findByIdAndUpdate(req.params.id, { $push: { comments: { $each: [comment], $position: 0 } } }, { new: true });
    return post ? res.status(201).json(post.comments) : notFound(res);
  }),
);

router.delete(
  '/comment/:id/:commentId',
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) return notFound(res);
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    const mayDelete = comment.user.toString() === req.userId || post.user.toString() === req.userId;
    if (!mayDelete) return res.status(403).json({ message: 'Not allowed to delete this comment' });
    post.comments.pull({ _id: req.params.commentId });
    await post.save();
    res.json(post.comments);
  }),
);

module.exports = router;
