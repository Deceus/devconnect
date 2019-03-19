const express = require('express');

const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../../model/User');
const keys = require('../../config/keys');

const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');


// @route   GET api/users/test
// @desc    tests user route
// @accesss Public
router.get('/test', (req, res) => res.json({
    msg: 'Users works',
}));

// @route   POST api/users/register
// @desc    register a user
// @accesss Public
router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email })
        .then((user) => {
            if (user) {
                errors.email = 'Email already exists';
                return res.status(400).json({ errors });
            }
            const avatar = gravatar.url(req.body.email, {
                s: '200', // size
                r: 'pg', // rating
                d: 'mm', // default
            });
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar,
                password: req.body.password,
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (hashErr, hash) => {
                    if (hashErr) {
                        throw hashErr;
                    }
                    newUser.password = hash;
                    newUser.save()
                        .then(result => res.json(result))
                        .catch(saveErr => console.log(saveErr));
                });
            });
        });
});

// @route   Post api/users/login
// @desc    Login User / Return JWT Token
// @accesss Public
router.post('/login', (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    const { email } = req.body;
    const { password } = req.body;

    User.findOne({
        email,
    })
        .then((user) => {
            if (!user) {
                errors.email = 'User not found';
                return res.status(404).json({ errors });
            }
            bcrypt.compare(password, user.password)
                .then((isMatch) => {
                    if (isMatch) {
                        const payload = {
                            id: user.id,
                            name: user.name,
                            avatar: user.avatar,
                        };

                        jwt.sign(payload, keys.secret, {
                            expiresIn: 3600,
                        }, (err, token) => {
                            res.json({
                                success: 'true',
                                token: `Bearer ${token}`,
                            });
                        });
                    } else {
                        errors.password = 'Password incorrect';
                        return res.status(400).json(errors);
                    }
                });
        });
});

// @route   Get api/users/current
// @desc    Return current user
// @accesss Private
router.get('/current', passport.authenticate('jwt', {
    session: false,
}), (req, res) => {
    res.json(req.user);
});

module.exports = router;
