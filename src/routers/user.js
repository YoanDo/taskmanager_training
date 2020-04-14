const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')

router.post('/users', async (req, res) => {
  const user = new User(req.body)
  const { email, password } = req.body
  try {
    await user.save()
    const token = await user.generateAuthToken()
    res.status(201).send({user, token})
  } catch (e) {
    res.status(400).send(e)
  }
})

router.post('/users/login', async (req,res) => {
  try {
    const { email, password } = req.body
    const user = await User.findByCredentials(email, password)
    const token = await user.generateAuthToken()
    res.send({user, token})
  } catch (e) {
    console.log(e)
    res.status(400).send()}
})


router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token )
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})
//user gets his own profile
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user)
})

router.get('/users/:id', async (req, res) => {
  const _id = req.params.id

  try {

    const user = await User.findById(_id)
    if (!user) return res.status(404).send()
    res.send(user)
  } catch (e) {
    res.status(500).send()
  }
})

router.patch('/users/:id', async (req, res) => {
  const _id = req.params.id
  const updates = Object.keys(req.body)
  const allowedUpdates = ['age', 'email', 'name', 'password']
  const isValid = updates.every((update) => allowedUpdates.includes(update))

  if (!isValid) return res.status(400).send({ error: 'Invalid updates!' })

  try {
    const user = await User.findById(_id)
    updates.forEach((update) =>  user[update] = req.body[update])
    await user.save()

    if (!user) return res.status(404).send()
    res.send(user)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.delete('/users/:id', async (req, res) => {
  const _id = req.params.id
  try {
    const user = await User.findByIdAndDelete(_id)
    if (!user) return res.status(404).send()
    res.send(user)

  } catch (e) { res.status(500).send(e) }
})


module.exports = router
