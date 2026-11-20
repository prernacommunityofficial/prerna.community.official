import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import TeamMember from '../models/TeamMember.js';
import ProblemStatement from '../models/ProblemStatement.js';
import Application from '../models/Application.js';
import ContactMessage from '../models/ContactMessage.js';
import ActivityLog from '../models/ActivityLog.js';
import OrganizationSettings from '../models/OrganizationSettings.js';
import EmailOtp from '../models/EmailOtp.js';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '../utils/email.js';
import { requireAuth, requireRole, requireUser, signAccessToken, signRefreshToken, signUserToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { ok, paginated } from '../utils/responses.js';

const router = Router();

function slugify(value) {
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function logActivity(req, action, entity, entityId, details) {
  await ActivityLog.create({ actor: req.admin?._id, action, entity, entityId, details });
}

async function seedAdmin() {
  if (await Admin.countDocuments()) return;
  if (!process.env.INITIAL_ADMIN_EMAIL || !process.env.INITIAL_ADMIN_PASSWORD) return;
  await Admin.create({
    name: process.env.INITIAL_ADMIN_NAME || 'Prerna Admin',
    email: process.env.INITIAL_ADMIN_EMAIL,
    password: process.env.INITIAL_ADMIN_PASSWORD,
    role: 'super_admin'
  });
  console.log('Initial admin account created');
}

router.post('/auth/login', async (req, res, next) => {
  try {
    await seedAdmin();
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
    if (!admin?.active || !(await admin.comparePassword(String(password)))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    ok(res, { accessToken: signAccessToken(admin), refreshToken: signRefreshToken(admin), admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (error) { next(error); }
});

router.post('/auth/logout', requireAuth, (req, res) => ok(res, null, 'Logged out'));
router.get('/auth/me', requireAuth, (req, res) => ok(res, { id: req.admin._id, name: req.admin.name, email: req.admin.email, role: req.admin.role }));
router.post('/auth/refresh', async (req, res, next) => {
  try {
    const payload = jwt.verify(req.body.refreshToken, process.env.JWT_REFRESH_SECRET);
    const admin = await Admin.findById(payload.sub);
    if (!admin?.active) return res.status(401).json({ success: false, message: 'Invalid session' });
    ok(res, { accessToken: signAccessToken(admin) });
  } catch { res.status(401).json({ success: false, message: 'Invalid or expired refresh token' }); }
});

function userResponse(user) {
  const data = user.toObject();
  delete data.password;
  return data;
}

router.post('/community/auth/register', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').toLowerCase().trim();
    const password = String(req.body.password || '');
    if (!name || !email || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Name, email, and an 8-character password are required.' });
    }
    const existing = await User.findOne({ email });
    if (existing?.emailVerified) {
      return res.status(409).json({ success: false, message: 'An account already exists with this email.' });
    }
    const recent = await EmailOtp.findOne({ email, purpose: 'register' }).sort({ lastSentAt: -1 });
    if (recent && Date.now() - recent.lastSentAt.getTime() < 60 * 1000) {
      return res.status(429).json({ success: false, message: 'Please wait 60 seconds before requesting another code.' });
    }
    const profile = {
      name,
      email,
      phone: req.body.phone,
      college: req.body.college,
      course: req.body.course,
      yearOfStudy: req.body.yearOfStudy,
      state: req.body.state,
      preferredDepartment: req.body.preferredDepartment,
      skills: typeof req.body.skills === 'string' ? req.body.skills.split(',').map(value => value.trim()).filter(Boolean) : req.body.skills,
      areasOfInterest: typeof req.body.areasOfInterest === 'string' ? req.body.areasOfInterest.split(',').map(value => value.trim()).filter(Boolean) : req.body.areasOfInterest,
      privacyConsent: req.body.privacyConsent === true || req.body.privacyConsent === 'true'
    };
    await EmailOtp.deleteMany({ email, purpose: 'register' });
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    await EmailOtp.create({
      email,
      purpose: 'register',
      otpHash: await bcrypt.hash(otp, 10),
      pendingPasswordHash: await bcrypt.hash(password, 12),
      profile,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      lastSentAt: new Date()
    });
    await sendOtpEmail(email, otp, 'register');
    ok(res, { requiresVerification: true, email }, 'Verification code sent');
  } catch (error) {
    if (error?.message?.includes('SMTP_USER')) {
      return res.status(503).json({ success: false, message: 'Email verification is not configured yet. Please add the Gmail SMTP app password.' });
    }
    next(error);
  }
});

router.post('/community/auth/register/verify', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const otp = String(req.body.otp || '').trim();
    const record = await EmailOtp.findOne({ email, purpose: 'register' });
    if (!record) return res.status(400).json({ success: false, message: 'Verification code expired or not found.' });
    if (record.expiresAt <= new Date()) return res.status(400).json({ success: false, message: 'Verification code expired. Please request a new one.' });
    if (record.attempts >= 5) return res.status(429).json({ success: false, message: 'Too many attempts. Request a new code.' });
    if (!await bcrypt.compare(otp, record.otpHash)) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ success: false, message: 'Invalid verification code.' });
    }
    const profile = record.profile || {};
    const randomPassword = await bcrypt.hash(String(Math.random()), 12);
    const user = await User.create({ ...profile, email, password: randomPassword, emailVerified: true });
    await User.updateOne({ _id: user._id }, { $set: { password: record.pendingPasswordHash } });
    await EmailOtp.deleteMany({ email, purpose: 'register' });
    ok(res, { accessToken: signUserToken(user), user: userResponse(user) }, 'Email verified and account created');
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: 'An account already exists with this email.' });
    next(error);
  }
});

router.post('/community/auth/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const user = await User.findOne({ email }).select('+password');
    if (!user?.active || !(await user.comparePassword(String(req.body.password || '')))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    if (!user.emailVerified) return res.status(403).json({ success: false, message: 'Please verify your email before signing in.' });
    ok(res, { accessToken: signUserToken(user), user: userResponse(user) });
  } catch (error) { next(error); }
});

router.post('/community/auth/reset/send', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this email.' });
    const recent = await EmailOtp.findOne({ email, purpose: 'reset' }).sort({ lastSentAt: -1 });
    if (recent && Date.now() - recent.lastSentAt.getTime() < 60 * 1000) {
      return res.status(429).json({ success: false, message: 'Please wait 60 seconds before requesting another code.' });
    }
    await EmailOtp.deleteMany({ email, purpose: 'reset' });
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    await EmailOtp.create({
      email,
      purpose: 'reset',
      otpHash: await bcrypt.hash(otp, 10),
      userId: user._id,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      lastSentAt: new Date()
    });
    await sendOtpEmail(email, otp, 'reset');
    ok(res, { requiresVerification: true, email }, 'Password reset code sent');
  } catch (error) {
    if (error?.message?.includes('SMTP_USER')) {
      return res.status(503).json({ success: false, message: 'Email verification is not configured yet. Please add the Gmail SMTP app password.' });
    }
    next(error);
  }
});

router.post('/community/auth/reset/verify', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const otp = String(req.body.otp || '').trim();
    const newPassword = String(req.body.newPassword || '');
    if (newPassword.length < 8) return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    const record = await EmailOtp.findOne({ email, purpose: 'reset' });
    if (!record) return res.status(400).json({ success: false, message: 'Reset code expired or not found.' });
    if (record.expiresAt <= new Date()) return res.status(400).json({ success: false, message: 'Reset code expired. Please request a new one.' });
    if (record.attempts >= 5) return res.status(429).json({ success: false, message: 'Too many attempts. Request a new code.' });
    if (!await bcrypt.compare(otp, record.otpHash)) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ success: false, message: 'Invalid reset code.' });
    }
    await User.updateOne({ _id: record.userId }, { $set: { password: await bcrypt.hash(newPassword, 12) } });
    await EmailOtp.deleteMany({ email, purpose: 'reset' });
    ok(res, null, 'Password reset successfully');
  } catch (error) { next(error); }
});

router.post('/community/auth/logout', requireUser, (req, res) => ok(res, null, 'Logged out'));
router.get('/community/profile', requireUser, (req, res) => ok(res, userResponse(req.user)));

router.put('/community/profile', requireUser, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'resume', maxCount: 1 }]), async (req, res, next) => {
  try {
    const body = { ...req.body };
    for (const field of ['skills', 'areasOfInterest']) {
      if (typeof body[field] === 'string') body[field] = body[field].split(',').map(value => value.trim()).filter(Boolean);
    }
    for (const field of ['notificationSettings', 'accountSettings']) {
      if (typeof body[field] === 'string') {
        try { body[field] = JSON.parse(body[field]); } catch { delete body[field]; }
      }
    }
    if (req.files?.avatar?.[0]) body.avatarUrl = `/uploads/${req.files.avatar[0].filename}`;
    if (req.files?.resume?.[0]) body.resumeUrl = `/uploads/${req.files.resume[0].filename}`;
    delete body.password;
    delete body.email;
    Object.assign(req.user, body);
    await req.user.save();
    ok(res, userResponse(req.user), 'Profile updated');
  } catch (error) { next(error); }
});

router.put('/community/profile/password', requireUser, async (req, res, next) => {
  try {
    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');
    if (newPassword.length < 8) return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    user.password = newPassword;
    await user.save();
    ok(res, null, 'Password changed');
  } catch (error) { next(error); }
});

router.delete('/community/account', requireUser, async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    ok(res, null, 'Account deleted');
  } catch (error) { next(error); }
});

router.get('/settings', async (req, res, next) => {
  try {
    const settings = await OrganizationSettings.findOne() || await OrganizationSettings.create({});
    ok(res, settings);
  } catch (error) { next(error); }
});
router.put('/settings', requireAuth, requireRole('super_admin', 'admin'), async (req, res, next) => {
  try {
    const settings = await OrganizationSettings.findOneAndUpdate({}, req.body, { new: true, upsert: true, runValidators: true });
    await logActivity(req, 'updated', 'settings', settings._id.toString());
    ok(res, settings);
  } catch (error) { next(error); }
});

router.get('/projects', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);
    const filter = {};
    if (req.query.published !== 'false') filter.published = true;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.featured === 'true') filter.featured = true;
    if (req.query.search) filter.$text = { $search: req.query.search };
    const sort = req.query.sort === 'name' ? { name: 1 } : { createdAt: -1 };
    const [items, total] = await Promise.all([Project.find(filter).populate('teamMembers', 'name role image').sort(sort).skip((page - 1) * limit).limit(limit), Project.countDocuments(filter)]);
    paginated(res, items, page, limit, total);
  } catch (error) { next(error); }
});
router.get('/projects/:slug', async (req, res, next) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug, published: true }).populate('teamMembers', 'name role department image');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    ok(res, project);
  } catch (error) { next(error); }
});
router.post('/projects', requireAuth, upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'images', maxCount: 8 }]), async (req, res, next) => {
  try {
    const body = { ...req.body };
    for (const field of ['keyFeatures', 'targetAudience', 'technologyStack', 'futureImprovements', 'teamMembers']) if (typeof body[field] === 'string') body[field] = body[field].split(',').map(v => v.trim()).filter(Boolean);
    body.slug = body.slug || slugify(body.name);
    if (req.files?.thumbnail?.[0]) body.thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
    if (req.files?.images) body.images = req.files.images.map(file => `/uploads/${file.filename}`);
    const project = await Project.create(body);
    await logActivity(req, 'created', 'project', project._id.toString());
    ok(res, project);
  } catch (error) { next(error); }
});
router.put('/projects/:id', requireAuth, upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'images', maxCount: 8 }]), async (req, res, next) => {
  try {
    const body = { ...req.body };
    for (const field of ['keyFeatures', 'targetAudience', 'technologyStack', 'futureImprovements', 'teamMembers']) if (typeof body[field] === 'string') body[field] = body[field].split(',').map(v => v.trim()).filter(Boolean);
    if (req.files?.thumbnail?.[0]) body.thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
    if (req.files?.images) body.images = req.files.images.map(file => `/uploads/${file.filename}`);
    const project = await Project.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    await logActivity(req, 'updated', 'project', project._id.toString());
    ok(res, project);
  } catch (error) { next(error); }
});
router.delete('/projects/:id', requireAuth, async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    await logActivity(req, 'deleted', 'project', req.params.id);
    ok(res, null, 'Project deleted');
  } catch (error) { next(error); }
});

router.get('/team', async (req, res, next) => {
  try {
    const filter = req.query.all === 'true' && req.admin ? {} : { active: true };
    const members = await TeamMember.find(filter).sort({ leadership: -1, name: 1 });
    ok(res, members);
  } catch (error) { next(error); }
});
router.get('/team/admin', requireAuth, async (req, res, next) => {
  try {
    const members = await TeamMember.find().sort({ leadership: -1, name: 1 });
    ok(res, members);
  } catch (error) { next(error); }
});
router.post('/team', requireAuth, upload.single('image'), async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (typeof body.skills === 'string') body.skills = body.skills.split(',').map(v => v.trim()).filter(Boolean);
    if (req.file) body.image = `/uploads/${req.file.filename}`;
    const member = await TeamMember.create(body);
    await logActivity(req, 'created', 'team member', member._id.toString());
    ok(res, member);
  } catch (error) { next(error); }
});
router.put('/team/:id', requireAuth, upload.single('image'), async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (typeof body.skills === 'string') body.skills = body.skills.split(',').map(v => v.trim()).filter(Boolean);
    if (req.file) body.image = `/uploads/${req.file.filename}`;
    const member = await TeamMember.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!member) return res.status(404).json({ success: false, message: 'Team member not found' });
    await logActivity(req, 'updated', 'team member', member._id.toString());
    ok(res, member);
  } catch (error) { next(error); }
});
router.delete('/team/:id', requireAuth, async (req, res, next) => {
  try { await TeamMember.findByIdAndDelete(req.params.id); await logActivity(req, 'deleted', 'team member', req.params.id); ok(res, null, 'Team member deleted'); } catch (error) { next(error); }
});

router.get('/problems', async (req, res, next) => {
  try {
    const filter = { approvalStatus: 'approved' };
    if (req.query.domain) filter.domain = req.query.domain;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = 12;
    const [items, total] = await Promise.all([ProblemStatement.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), ProblemStatement.countDocuments(filter)]);
    paginated(res, items, page, limit, total);
  } catch (error) { next(error); }
});
router.get('/problems/admin', requireAuth, async (req, res, next) => {
  try { const items = await ProblemStatement.find().sort({ createdAt: -1 }); ok(res, items); } catch (error) { next(error); }
});
router.post('/problems', async (req, res, next) => {
  try {
    const problem = await ProblemStatement.create({ ...req.body, approvalStatus: 'pending' });
    ok(res, { id: problem._id }, 'Problem submitted for review');
  } catch (error) { next(error); }
});
router.put('/problems/:id', requireAuth, async (req, res, next) => {
  try {
    const problem = await ProblemStatement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    await logActivity(req, 'updated', 'problem', problem._id.toString());
    ok(res, problem);
  } catch (error) { next(error); }
});
router.delete('/problems/:id', requireAuth, async (req, res, next) => {
  try { await ProblemStatement.findByIdAndDelete(req.params.id); await logActivity(req, 'deleted', 'problem', req.params.id); ok(res, null, 'Problem deleted'); } catch (error) { next(error); }
});
router.post('/applications', upload.single('resume'), async (req, res, next) => {
  try {
    const body = { ...req.body, privacyConsent: req.body.privacyConsent === 'true' || req.body.privacyConsent === true };
    for (const field of ['skills', 'areasOfInterest']) if (typeof body[field] === 'string') body[field] = body[field].split(',').map(v => v.trim()).filter(Boolean);
    if (req.file) body.resumeUrl = `/uploads/${req.file.filename}`;
    const application = await Application.create(body);
    ok(res, { id: application._id }, 'Application submitted');
  } catch (error) { next(error); }
});
router.get('/applications', requireAuth, async (req, res, next) => {
  try { const filter = {}; if (req.query.status) filter.status = req.query.status; if (req.query.department) filter.preferredDepartment = req.query.department; const items = await Application.find(filter).sort({ createdAt: -1 }); ok(res, items); } catch (error) { next(error); }
});
router.put('/applications/:id', requireAuth, async (req, res, next) => {
  try { const item = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); await logActivity(req, 'updated', 'application', req.params.id); ok(res, item); } catch (error) { next(error); }
});
router.delete('/applications/:id', requireAuth, async (req, res, next) => {
  try { await Application.findByIdAndDelete(req.params.id); await logActivity(req, 'deleted', 'application', req.params.id); ok(res, null, 'Application deleted'); } catch (error) { next(error); }
});

router.post('/contact', async (req, res, next) => {
  try { const message = await ContactMessage.create(req.body); ok(res, { id: message._id }, 'Enquiry submitted'); } catch (error) { next(error); }
});
router.get('/contact', requireAuth, async (req, res, next) => {
  try { ok(res, await ContactMessage.find().sort({ createdAt: -1 })); } catch (error) { next(error); }
});
router.put('/contact/:id', requireAuth, async (req, res, next) => {
  try { const item = await ContactMessage.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); ok(res, item); } catch (error) { next(error); }
});
router.delete('/contact/:id', requireAuth, async (req, res, next) => {
  try { await ContactMessage.findByIdAndDelete(req.params.id); ok(res, null, 'Enquiry deleted'); } catch (error) { next(error); }
});

router.get('/dashboard/stats', requireAuth, async (req, res, next) => {
  try {
    const [members, activeProjects, completedProjects, pendingProjects, problems, pendingApplications, enquiries] = await Promise.all([
      TeamMember.countDocuments({ active: true }),
      Project.countDocuments({ published: true, status: { $ne: 'Completed' } }),
      Project.countDocuments({ published: true, status: 'Completed' }),
      Project.countDocuments({ published: false }),
      ProblemStatement.countDocuments(),
      Application.countDocuments({ status: 'pending' }),
      ContactMessage.countDocuments({ resolved: false })
    ]);
    ok(res, { members, activeProjects, completedProjects, pendingProjects, problems, pendingApplications, enquiries });
  } catch (error) { next(error); }
});
router.get('/dashboard/analytics', requireAuth, async (req, res, next) => {
  try {
    const [projectStatus, problemStatus, applicationStatus] = await Promise.all([
      Project.aggregate([{ $group: { _id: '$status', value: { $sum: 1 } } }, { $sort: { value: -1 } }]),
      ProblemStatement.aggregate([{ $group: { _id: '$approvalStatus', value: { $sum: 1 } } }]),
      Application.aggregate([{ $group: { _id: '$status', value: { $sum: 1 } } }])
    ]);
    ok(res, { projectStatus, problemStatus, applicationStatus });
  } catch (error) { next(error); }
});
router.get('/dashboard/recent-activities', requireAuth, async (req, res, next) => {
  try { ok(res, await ActivityLog.find().populate('actor', 'name').sort({ createdAt: -1 }).limit(20)); } catch (error) { next(error); }
});

export default router;
