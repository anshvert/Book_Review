const express = require('express');
const Review = require('../models/Review');
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/:id/reviews', auth, async (req, res) => {
    const { rating, comment } = req.body;
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        const review = new Review({
            book: req.params.id,
            user: req.user.id,
            rating,
            comment,
        });
        await review.save();
        res.status(201).json(review);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already reviewed this book' });
        }
        res.status(500).json({ message: 'Error submitting review' });
    }
});

router.put('/:id', auth, async (req, res) => {
    const { rating, comment } = req.body;
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        if (review.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this review' });
        }
        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        await review.save();
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: 'Error updating review' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        if (review.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }
        await review.remove();
        res.json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review' });
    }
});

module.exports = router;