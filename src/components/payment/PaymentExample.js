import React, { useState } from 'react';
import { Button, Card, CardContent, Typography, Box } from '@mui/material';
import { Payment } from '@mui/icons-material';
import PaymentModal from './PaymentModal';

/**
 * Example Component Showing How to Use Payment Modal
 * 
 * Use this pattern in your pages:
 * - ProposalAcceptance
 * - BookingConfirmation
 * - ServicePurchase
 * - etc.
 */
const PaymentExample = () => {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Example proposal data
  const proposal = {
    id: 'proposal-123',
    requestId: 'request-456',
    amount: 250,
    description: 'Custom woodworking project',
    artisan: 'John Doe',
  };

  const handleOpenPayment = () => {
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (result) => {
    console.log('Payment successful!', result);
    alert('Payment successful! The artisan has been notified.');
    
    // TODO: Update proposal status, send notifications, etc.
    // await updateProposalStatus(proposal.id, 'accepted');
    // await sendNotification(proposal.artisanId, 'Proposal accepted!');
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    alert('Payment failed. Please try again.');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Accept Proposal
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Artisan: <strong>{proposal.artisan}</strong>
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Service: {proposal.description}
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: 'success.50', 
            borderRadius: 2, 
            mb: 2,
            border: '1px solid',
            borderColor: 'success.200',
          }}>
            <Typography variant="h4" color="success.main" gutterBottom>
              ${proposal.amount.toFixed(2)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total amount (includes platform fees)
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<Payment />}
            onClick={handleOpenPayment}
          >
            Accept & Pay
          </Button>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
            Funds will be held securely until project completion
          </Typography>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        amount={proposal.amount}
        proposalId={proposal.id}
        requestId={proposal.requestId}
        description={`Payment for: ${proposal.description}`}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </Box>
  );
};

export default PaymentExample;

/**
 * USAGE IN OTHER COMPONENTS:
 * 
 * 1. In ViewProposalsPage.js:
 * ---------------------------
 * import PaymentModal from '../payment/PaymentModal';
 * 
 * const [paymentModalOpen, setPaymentModalOpen] = useState(false);
 * const [selectedProposal, setSelectedProposal] = useState(null);
 * 
 * const handleAcceptProposal = (proposal) => {
 *   setSelectedProposal(proposal);
 *   setPaymentModalOpen(true);
 * };
 * 
 * <PaymentModal
 *   open={paymentModalOpen}
 *   onClose={() => setPaymentModalOpen(false)}
 *   amount={selectedProposal?.proposal.price}
 *   proposalId={selectedProposal?.id}
 *   onSuccess={handlePaymentSuccess}
 * />
 * 
 * 
 * 2. In BookingPage.js:
 * ---------------------
 * const handleBookService = () => {
 *   setPaymentModalOpen(true);
 * };
 * 
 * <PaymentModal
 *   open={paymentModalOpen}
 *   onClose={() => setPaymentModalOpen(false)}
 *   amount={servicePrice}
 *   description={`Booking: ${serviceName}`}
 *   onSuccess={async (result) => {
 *     await createBooking({...});
 *     navigate('/confirmation');
 *   }}
 * />
 * 
 * 
 * 3. In SettingsPage.js (Add Payment Method):
 * ------------------------------------------
 * import paymentService from '../../lib/paymentService';
 * 
 * const handleAddCard = async (cardDetails) => {
 *   try {
 *     await paymentService.addPaymentMethod({
 *       userId: user.id,
 *       cardDetails,
 *       billingAddress,
 *     });
 *     alert('Card added successfully!');
 *   } catch (error) {
 *     alert('Failed to add card');
 *   }
 * };
 * 
 * 
 * 4. In ProviderDashboard.js (Request Payout):
 * -------------------------------------------
 * import paymentService from '../../lib/paymentService';
 * 
 * const handleRequestPayout = async () => {
 *   try {
 *     const wallet = await paymentService.getWalletBalance(user.id);
 *     
 *     await paymentService.createPayout({
 *       userId: user.id,
 *       amount: wallet.available_balance,
 *       destinationType: 'bank_account',
 *       destinationId: 'ba_123',
 *       description: 'Weekly payout',
 *     });
 *     
 *     alert('Payout initiated! ETA: 3-5 business days');
 *   } catch (error) {
 *     alert(error.message);
 *   }
 * };
 */


