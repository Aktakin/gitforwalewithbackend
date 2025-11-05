import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Button,
  Chip,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  Radio,
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  Payment,
  Star,
  AttachMoney,
  CreditCard,
  PayPal,
  AccountBalance,
  Security,
  Verified,
  CalendarToday,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const BookingPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    package: 'standard',
    requirements: '',
    deadline: '',
    budget: '',
    paymentMethod: 'credit_card',
    agreedToTerms: false,
  });
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  // Mock skill data
  const skillData = {
    id: 1,
    title: "Professional Website Development",
    provider: {
      name: "Alex Chen",
      avatar: "/api/placeholder/60/60",
      rating: 4.9,
      reviews: 127,
      responseTime: "1 hour",
      completedOrders: 89
    },
    packages: {
      basic: {
        name: "Basic Website",
        price: 299,
        description: "Perfect starter website for small businesses",
        delivery: "5 days",
        revisions: 2,
        features: [
          "Up to 5 pages",
          "Responsive design",
          "Basic SEO optimization",
          "Contact form",
          "Social media integration"
        ]
      },
      standard: {
        name: "Professional Website",
        price: 599,
        description: "Complete business website with advanced features",
        delivery: "7 days",
        revisions: 4,
        features: [
          "Up to 10 pages",
          "Custom design",
          "Advanced SEO optimization",
          "Blog functionality",
          "E-commerce integration",
          "Admin panel",
          "Email setup"
        ]
      },
      premium: {
        name: "Enterprise Solution",
        price: 1299,
        description: "Full-featured website with custom functionality",
        delivery: "14 days",
        revisions: "Unlimited",
        features: [
          "Unlimited pages",
          "Custom development",
          "Advanced integrations",
          "User authentication",
          "Payment processing",
          "6 months support"
        ]
      }
    }
  };

  const steps = [
    'Package Selection',
    'Project Details',
    'Payment & Confirmation'
  ];

  const selectedPackage = skillData.packages[bookingData.package];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      setConfirmationOpen(true);
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleConfirmOrder = () => {
    setConfirmationOpen(false);
    // Simulate order creation
    setTimeout(() => {
      alert('🎉 Order placed successfully! Redirecting to your dashboard...');
      navigate('/client/dashboard');
    }, 1000);
  };

  const calculateTotal = () => {
    const basePrice = selectedPackage.price;
    const platformFee = Math.round(basePrice * 0.05); // 5% platform fee
    const processingFee = Math.round(basePrice * 0.029 + 30); // 2.9% + $0.30
    return {
      subtotal: basePrice,
      platformFee,
      processingFee,
      total: basePrice + platformFee + processingFee
    };
  };

  const costs = calculateTotal();

  // Step 1: Package Selection
  const PackageSelectionStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Choose Your Package
        </Typography>
        
        <Grid container spacing={2}>
          {Object.entries(skillData.packages).map(([key, pkg]) => (
            <Grid item xs={12} key={key}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: bookingData.package === key ? 2 : 1,
                  borderColor: bookingData.package === key ? 'primary.main' : 'divider',
                  '&:hover': { borderColor: 'primary.main' }
                }}
                onClick={() => setBookingData({...bookingData, package: key})}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        {pkg.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {pkg.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body2">{pkg.delivery}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="body2">{pkg.revisions} revisions</Typography>
                        </Box>
                      </Box>
                      
                      <List dense sx={{ p: 0 }}>
                        {pkg.features.slice(0, 3).map((feature, index) => (
                          <ListItem key={index} sx={{ px: 0, py: 0.25 }}>
                            <ListItemIcon sx={{ minWidth: 20 }}>
                              <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={feature}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                        {pkg.features.length > 3 && (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 2.5 }}>
                            +{pkg.features.length - 3} more features
                          </Typography>
                        )}
                      </List>
                    </Box>
                    
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                        ${pkg.price}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card sx={{ position: 'sticky', top: 20 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Seller Information
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar src={skillData.provider.avatar} sx={{ width: 48, height: 48 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {skillData.provider.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                  <Typography variant="body2">
                    {skillData.provider.rating} ({skillData.provider.reviews} reviews)
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Response Time:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {skillData.provider.responseTime}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Orders Completed:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {skillData.provider.completedOrders}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Step 2: Project Details
  const ProjectDetailsStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Project Requirements
        </Typography>
        
        <TextField
          fullWidth
          label="Describe your project in detail"
          multiline
          rows={6}
          value={bookingData.requirements}
          onChange={(e) => setBookingData({...bookingData, requirements: e.target.value})}
          placeholder="Please provide detailed information about your project, including any specific requirements, preferences, or files you want to share..."
          sx={{ mb: 3 }}
        />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Preferred Deadline"
              type="date"
              value={bookingData.deadline}
              onChange={(e) => setBookingData({...bookingData, deadline: e.target.value})}
              InputLabelProps={{ shrink: true }}
              helperText="Optional: Specify if you need it earlier"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Budget Range</InputLabel>
              <Select
                value={bookingData.budget}
                label="Budget Range"
                onChange={(e) => setBookingData({...bookingData, budget: e.target.value})}
              >
                <MenuItem value="flexible">Flexible</MenuItem>
                <MenuItem value="exact">Exact Package Price</MenuItem>
                <MenuItem value="lower">Looking for Lower Price</MenuItem>
                <MenuItem value="higher">Can Pay More for Premium</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Selected Package
            </Typography>
            
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              {selectedPackage.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {selectedPackage.description}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Delivery Time:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {selectedPackage.delivery}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Revisions:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {selectedPackage.revisions}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Price:</Typography>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                ${selectedPackage.price}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Step 3: Payment & Confirmation
  const PaymentStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Payment Method
        </Typography>
        
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <RadioGroup
            value={bookingData.paymentMethod}
            onChange={(e) => setBookingData({...bookingData, paymentMethod: e.target.value})}
          >
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <FormControlLabel
                value="credit_card"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CreditCard />
                    <Typography>Credit/Debit Card</Typography>
                  </Box>
                }
              />
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <FormControlLabel
                value="paypal"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PayPal />
                    <Typography>PayPal</Typography>
                  </Box>
                }
              />
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2 }}>
              <FormControlLabel
                value="bank_transfer"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountBalance />
                    <Typography>Bank Transfer</Typography>
                  </Box>
                }
              />
            </Paper>
          </RadioGroup>
        </FormControl>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Your payment will be held securely until the project is completed to your satisfaction.
          </Typography>
        </Alert>
        
        <FormControlLabel
          control={
            <Checkbox
              checked={bookingData.agreedToTerms}
              onChange={(e) => setBookingData({...bookingData, agreedToTerms: e.target.checked})}
            />
          }
          label="I agree to the Terms of Service and understand the cancellation policy"
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Order Summary
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">{selectedPackage.name}:</Typography>
              <Typography variant="body2">${costs.subtotal}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Platform Fee:</Typography>
              <Typography variant="body2">${costs.platformFee}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2">Processing Fee:</Typography>
              <Typography variant="body2">${costs.processingFee}</Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Total:</Typography>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                ${costs.total}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Security sx={{ fontSize: 16, color: 'success.main' }} />
              <Typography variant="caption" color="text.secondary">
                Secure payment protected by SkillBridge
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <PackageSelectionStep />;
      case 1:
        return <ProjectDetailsStep />;
      case 2:
        return <PaymentStep />;
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 1,
            background: 'linear-gradient(135deg, #000080 0%, #3333FF 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Complete Your Order
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          {skillData.title}
        </Typography>
      </motion.div>

      {/* Stepper */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Paper sx={{ p: 3, mb: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {/* Step Content */}
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {getStepContent(activeStep)}
          </motion.div>
          
          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={activeStep === 2 && !bookingData.agreedToTerms}
            >
              {activeStep === steps.length - 1 ? 'Place Order' : 'Next'}
            </Button>
          </Box>
        </Paper>
      </motion.div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Your Order</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            You're about to place an order for <strong>{selectedPackage.name}</strong> with <strong>{skillData.provider.name}</strong>
          </Alert>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Total Amount:</strong> ${costs.total}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Expected Delivery:</strong> {selectedPackage.delivery}
          </Typography>
          <Typography variant="body2">
            Your payment will be held securely until the project is completed to your satisfaction.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleConfirmOrder}
          >
            Confirm & Pay ${costs.total}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingPage;



