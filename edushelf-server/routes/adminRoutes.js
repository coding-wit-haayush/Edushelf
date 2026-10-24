const express = require('express');
const router  = express.Router();
const {
  getStats, getPendingBooks, getAllBooksAdmin, approveBook, rejectBook,
  getAllUsers, deleteUser, changeUserRole,
  getRequests, updateRequestStatus,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All admin routes are protected + admin only
router.use(protect, adminOnly);

router.get('/stats',                    getStats);
router.get('/books',                    getAllBooksAdmin);
router.get('/books/pending',            getPendingBooks);
router.put('/books/:id/approve',        approveBook);
router.put('/books/:id/reject',         rejectBook);
router.get('/users',                    getAllUsers);
router.delete('/users/:id',             deleteUser);
router.put('/users/:id/role',           changeUserRole);
router.get('/requests',                 getRequests);
router.put('/requests/:id',             updateRequestStatus);

module.exports = router;
