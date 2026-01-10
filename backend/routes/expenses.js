const express = require('express');
const { body, validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const Settlement = require('../models/Settlement');
const auth = require('../middleware/auth');

const router = express.Router();

// Add expense
router.post('/', auth, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('groupId').isMongoId().withMessage('Valid group ID is required'),
  body('date').optional().isISO8601().withMessage('Valid date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { title, amount, groupId, date } = req.body;

    // Check if group exists and user is a member
    const group = await Group.findById(groupId).populate('members');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.some(member => member._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Calculate equal split
    const splitAmount = parseFloat((amount / group.members.length).toFixed(2));
    const splits = group.members.map(member => ({
      user: member._id,
      amount: splitAmount
    }));

    const expense = new Expense({
      title,
      amount,
      date: date || new Date(),
      paidBy: req.user._id,
      group: groupId,
      splits
    });

    await expense.save();
    await expense.populate('paidBy', 'name email');
    await expense.populate('splits.user', 'name email');

    res.status(201).json({
      message: 'Expense added successfully',
      expense
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get group expenses
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if group exists and user is a member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const expenses = await Expense.find({ group: groupId })
      .populate('paidBy', 'name email')
      .populate('splits.user', 'name email')
      .sort({ date: -1 });

    res.json({ expenses });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get group balances
router.get('/balances/:groupId', auth, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if group exists and user is a member
    const group = await Group.findById(groupId).populate('members', 'name email');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.some(member => member._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all expenses for the group
    const expenses = await Expense.find({ group: groupId });
    
    // Get all settlements for the group
    const settlements = await Settlement.find({ group: groupId });

    // Calculate balances
    const balances = {};
    
    // Initialize balances for all members
    group.members.forEach(member => {
      balances[member._id.toString()] = {
        user: member,
        totalPaid: 0,
        totalOwed: 0,
        actualSpend: 0, // Only from expenses, not settlements
        netBalance: 0
      };
    });

    // Calculate from expenses only (actual spending)
    expenses.forEach(expense => {
      const paidById = expense.paidBy.toString();
      
      // Add to total paid
      if (balances[paidById]) {
        balances[paidById].totalPaid += expense.amount;
      }

      // Add to total owed and actual spend for each split
      expense.splits.forEach(split => {
        const userId = split.user.toString();
        if (balances[userId]) {
          balances[userId].totalOwed += split.amount;
          balances[userId].actualSpend += split.amount; // Track actual spending
        }
      });
    });

    // Apply settlements (only affects totalPaid and totalOwed, NOT actualSpend)
    settlements.forEach(settlement => {
      const payerId = settlement.payer.toString();
      const receiverId = settlement.receiver.toString();
      
      if (balances[payerId] && balances[receiverId]) {
        // Payer has paid more money (increases their totalPaid)
        balances[payerId].totalPaid += settlement.amount;
        // Receiver gets money, so they owe less (increases their totalOwed, which reduces net balance)
        balances[receiverId].totalOwed += settlement.amount;
      }
    });

    // Calculate net balances
    Object.keys(balances).forEach(userId => {
      balances[userId].netBalance = balances[userId].totalPaid - balances[userId].totalOwed;
    });

    res.json({ balances: Object.values(balances) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Settle balance
router.post('/settle', auth, [
  body('groupId').isMongoId().withMessage('Valid group ID is required'),
  body('receiverId').isMongoId().withMessage('Valid receiver ID is required'),
  body('amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { groupId, receiverId, amount } = req.body;

    // Check if group exists and user is a member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.includes(req.user._id) || !group.members.includes(receiverId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const settlement = new Settlement({
      group: groupId,
      payer: req.user._id,
      receiver: receiverId,
      amount
    });

    await settlement.save();
    await settlement.populate('payer', 'name email');
    await settlement.populate('receiver', 'name email');

    res.status(201).json({
      message: 'Settlement recorded successfully',
      settlement
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get settlements for a group
router.get('/settlements/:groupId', auth, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if group exists and user is a member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const settlements = await Settlement.find({ group: groupId })
      .populate('payer', 'name email')
      .populate('receiver', 'name email')
      .sort({ settledAt: -1 });

    res.json({ settlements });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;