const express = require('express');
const { body, validationResult } = require('express-validator');
const Group = require('../models/Group');
const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');
const auth = require('../middleware/auth');

const router = express.Router();

// Create group
router.post('/', auth, [
  body('name').trim().isLength({ min: 1 }).withMessage('Group name is required'),
  body('description').optional().trim()
], async (req, res) => {
  try {
    console.log('Creating group request received');
    console.log('Request body:', req.body);
    console.log('User:', req.user.email);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { name, description } = req.body;

    // Generate unique join code
    let joinCode;
    let isUnique = false;
    
    while (!isUnique) {
      joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingGroup = await Group.findOne({ joinCode });
      if (!existingGroup) {
        isUnique = true;
      }
    }

    console.log('Creating group with name:', name, 'and joinCode:', joinCode);

    const group = new Group({
      name,
      description,
      joinCode,
      createdBy: req.user._id,
      members: [req.user._id]
    });

    console.log('Group object created, saving to database...');
    await group.save();
    console.log('Group saved successfully');

    await group.populate('members', 'name email');
    await group.populate('createdBy', 'name email');

    console.log('Group populated, sending response');

    res.status(201).json({
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Join group by code
router.post('/join', auth, [
  body('joinCode').trim().isLength({ min: 1 }).withMessage('Join code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { joinCode } = req.body;

    const group = await Group.findOne({ joinCode: joinCode.toUpperCase() });
    if (!group) {
      return res.status(404).json({ message: 'Invalid join code' });
    }

    // Check if user is already a member
    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    // Add user to group
    group.members.push(req.user._id);
    await group.save();
    await group.populate('members', 'name email');
    await group.populate('createdBy', 'name email');

    res.json({
      message: 'Successfully joined group',
      group
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's groups
router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('members', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ groups });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single group
router.get('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    if (!group.members.some(member => member._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ group });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete group
router.delete('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is the creator of the group
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only group creator can delete the group' });
    }

    // Delete all related expenses and settlements
    await Expense.deleteMany({ group: req.params.id });
    await Settlement.deleteMany({ group: req.params.id });
    
    // Delete the group
    await Group.findByIdAndDelete(req.params.id);

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;