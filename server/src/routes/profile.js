const express = require('express');
const { body } = require('express-validator');
const Profile = require('../models/Profile');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();
const withUser = (q) => q.populate('user', ['name', 'avatar']);
const noProfile = (res) => res.status(404).json({ message: 'Profile not found' });
const requiredDate = (field) => body(field).isISO8601().withMessage('A valid start date is required');

router.get('/', asyncHandler(async (req, res) => res.json(await withUser(Profile.find().sort({ createdAt: -1 })))));

router.get(
  '/me',
  auth,
  asyncHandler(async (req, res) => {
    const profile = await withUser(Profile.findOne({ user: req.userId }));
    return profile ? res.json(profile) : noProfile(res);
  }),
);

router.get(
  '/user/:userId',
  asyncHandler(async (req, res) => {
    const profile = await withUser(Profile.findOne({ user: req.params.userId }));
    return profile ? res.json(profile) : noProfile(res);
  }),
);

router.post(
  '/',
  auth,
  [
    body('status').trim().notEmpty().withMessage('Status is required'),
    body('skills').notEmpty().withMessage('Skills are required'),
    body('website').optional({ values: 'falsy' }).isURL().withMessage('Website must be a valid URL'),
    body('githubUsername').optional({ values: 'falsy' }).matches(/^[a-zA-Z0-9-]{1,39}$/).withMessage('Enter a valid GitHub username'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { status, company, website, location, bio, githubUsername } = req.body;
    const skills = (Array.isArray(req.body.skills) ? req.body.skills : String(req.body.skills).split(','))
      .map((s) => s.trim())
      .filter(Boolean);
    // Only whitelisted fields are written, so clients cannot overwrite user, experience or education here.
    const fields = { status, company, website, location, bio, githubUsername, skills };
    const profile = await Profile.findOneAndUpdate({ user: req.userId }, { $set: fields }, { new: true, upsert: true, setDefaultsOnInsert: true });
    res.json(profile);
  }),
);

router.delete(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    await Post.deleteMany({ user: req.userId });
    await Post.updateMany({}, { $pull: { likes: { user: req.userId }, comments: { user: req.userId } } });
    await Profile.findOneAndDelete({ user: req.userId });
    await User.findByIdAndDelete(req.userId);
    res.json({ message: 'Account deleted' });
  }),
);

function entryRoutes(path, rules, pick) {
  router.put(
    `/${path}`,
    auth,
    rules,
    validate,
    asyncHandler(async (req, res) => {
      const profile = await Profile.findOneAndUpdate(
        { user: req.userId },
        { $push: { [path]: { $each: [pick(req.body)], $position: 0 } } },
        { new: true },
      );
      return profile ? res.json(profile) : noProfile(res);
    }),
  );
  router.delete(
    `/${path}/:entryId`,
    auth,
    asyncHandler(async (req, res) => {
      const profile = await Profile.findOneAndUpdate({ user: req.userId }, { $pull: { [path]: { _id: req.params.entryId } } }, { new: true });
      return profile ? res.json(profile) : noProfile(res);
    }),
  );
}

entryRoutes(
  'experience',
  [body('title').trim().notEmpty().withMessage('Title is required'), body('company').trim().notEmpty().withMessage('Company is required'), requiredDate('from')],
  ({ title, company, location, from, to, current, description }) => ({ title, company, location, from, to: current ? undefined : to || undefined, current: !!current, description }),
);
entryRoutes(
  'education',
  [body('school').trim().notEmpty().withMessage('School is required'), body('degree').trim().notEmpty().withMessage('Degree is required'), requiredDate('from')],
  ({ school, degree, fieldOfStudy, from, to, current, description }) => ({ school, degree, fieldOfStudy, from, to: current ? undefined : to || undefined, current: !!current, description }),
);

router.get(
  '/github/:username',
  asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!/^[a-zA-Z0-9-]{1,39}$/.test(username)) return res.status(400).json({ message: 'Invalid GitHub username' });
    const headers = { 'User-Agent': 'devconnector', Accept: 'application/vnd.github+json' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    let response;
    try {
      response = await fetch(`https://api.github.com/users/${username}/repos?per_page=5&sort=created&direction=desc`, {
        headers,
        signal: AbortSignal.timeout(8000),
      });
    } catch {
      return res.status(502).json({ message: 'Could not reach GitHub' });
    }
    if (response.status === 404) return res.status(404).json({ message: 'No GitHub user found' });
    if (!response.ok) return res.status(502).json({ message: 'GitHub request failed' });
    const repos = await response.json();
    res.json(repos.map((r) => ({ id: r.id, name: r.name, url: r.html_url, description: r.description, stars: r.stargazers_count, forks: r.forks_count })));
  }),
);

module.exports = router;
