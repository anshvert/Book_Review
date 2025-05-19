const express = require('express');
const Book = require('../models/Book');
const Review = require('../models/Review');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, async (req, res) => {
    const { title, author, genre } = req.body;
    try {
        const book = new Book({ title, author, genre });
        await book.save();
        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({ message: 'Error adding book' });
    }
});

router.get('/', async (req, res) => {
    const { page = 1, limit = 10, author, genre } = req.query;
    const query = {};
    if (author) query.author = new RegExp(author, 'i');
    if (genre) query.genre = new RegExp(genre, 'i');
    try {
        const books = await Book.find(query)
            .limit(limit)
            .skip((page - 1) * limit);
        const total = await Book.countDocuments(query);
        res.json({ books, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books' });
    }
});

router.get('/:id', async (req, res) => {
    const { page = 1, limit = 5 } = req.query;
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        const reviews = await Review.find({ book: req.params.id })
            .populate('user', 'username')
            .limit(limit * 1)
            .skip((page - 1) * limit);
        const totalReviews = await Review.countDocuments({ book: req.params.id });
        const averageRating = await Review.aggregate([
            { $match: { book: mongoose.Types.ObjectId(req.params.id) } },
            { $group: { _id: null, avgRating: { $avg: '$rating' } } },
        ]);
        res.json({
            book,
            reviews,
            totalReviews,
            averageRating: averageRating[0]?.avgRating || 0,
            page,
            pages: Math.ceil(totalReviews / limit),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching book details' });
    }
});

router.get('/search', async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.status(400).json({ message: 'Search query is required' });
    }
    try {
        const books = await Book.find({
            $or: [
                { title: new RegExp(q, 'i') },
                { author: new RegExp(q, 'i') },
            ],
        });
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Error searching books' });
    }
});

module.exports = router;