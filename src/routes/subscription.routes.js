import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from '../controllers/subscription.controller';

const router  = express.Router();

router.route('/toggle-subscription/:channelId').post(verifyJWT, toggleSubscription);
router.route('/getUser-channel-subscribers/:channelId').get(verifyJWT, getUserChannelSubscribers);
router.route('/get-subscribed-channels/:subscriberId').get(verifyJWT, getSubscribedChannels);

export default router;

