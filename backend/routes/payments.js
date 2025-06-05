const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { auth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get payment dashboard data for employee
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('totalTokens availableTokens cashedOutTokens totalEarnings paymentHistory');
    
    const paymentData = {
      totalTokens: user.totalTokens || 0,
      availableTokens: user.availableTokens || 0,
      cashedOutTokens: user.cashedOutTokens || 0,
      totalEarnings: user.totalEarnings || 0,
      availableEarnings: (user.availableTokens || 0) * 1, // 1 rupee per token
      paymentHistory: user.paymentHistory || []
    };

    res.json(paymentData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cash out tokens
router.post('/cashout', auth, async (req, res) => {
  try {
    const { tokens } = req.body;
    
    if (!tokens || tokens <= 0) {
      return res.status(400).json({ message: 'Invalid token amount' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.availableTokens < tokens) {
      return res.status(400).json({ message: 'Insufficient tokens available for cash out' });
    }

    const amountInRupees = tokens * 1; // 1 rupee per token
    const amountInPaisa = amountInRupees * 100; // Stripe uses smallest currency unit

    // Create a payment intent with Stripe
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInPaisa,
        currency: 'inr',
        metadata: {
          userId: user._id.toString(),
          tokens: tokens.toString(),
          type: 'token_cashout'
        },
        // For instant transfers, you might want to use transfers API instead
        // This is a simplified version for demonstration
      });

      // Update user's token balances
      user.availableTokens -= tokens;
      user.cashedOutTokens += tokens;
      user.totalEarnings += amountInRupees;

      // Add to payment history
      user.paymentHistory.push({
        amount: amountInRupees,
        tokens: tokens,
        transactionId: paymentIntent.id,
        status: 'pending'
      });

      await user.save();

      res.json({
        success: true,
        message: `Successfully initiated cash out of ${tokens} tokens (₹${amountInRupees})`,
        transactionId: paymentIntent.id,
        amount: amountInRupees,
        tokens: tokens
      });

    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
      res.status(500).json({ message: 'Payment processing failed' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Webhook to handle Stripe events (for production)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      if (paymentIntent.metadata.type === 'token_cashout') {
        try {
          const user = await User.findById(paymentIntent.metadata.userId);
          
          if (user) {
            // Find the payment in history and update status
            const payment = user.paymentHistory.find(
              p => p.transactionId === paymentIntent.id
            );
            
            if (payment) {
              payment.status = 'completed';
              await user.save();
            }
          }
        } catch (error) {
          console.error('Error updating payment status:', error);
        }
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      
      if (failedPayment.metadata.type === 'token_cashout') {
        try {
          const user = await User.findById(failedPayment.metadata.userId);
          
          if (user) {
            // Find the payment in history and update status
            const payment = user.paymentHistory.find(
              p => p.transactionId === failedPayment.id
            );
            
            if (payment) {
              payment.status = 'failed';
              
              // Refund the tokens back to available balance
              user.availableTokens += payment.tokens;
              user.cashedOutTokens -= payment.tokens;
              user.totalEarnings -= payment.amount;
              
              await user.save();
            }
          }
        } catch (error) {
          console.error('Error handling failed payment:', error);
        }
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Get payment history
router.get('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('paymentHistory');
    
    res.json(user.paymentHistory || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
