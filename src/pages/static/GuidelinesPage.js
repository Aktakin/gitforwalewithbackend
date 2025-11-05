import React from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Avatar } from '@mui/material';
import { Gavel, ThumbUp, Security, Report, Star, Handshake } from '@mui/icons-material';
import { motion } from 'framer-motion';

const GuidelinesPage = () => {
  const guidelines = [
    {
      icon: <ThumbUp />,
      title: 'Be Professional',
      rules: [
        'Communicate clearly and respectfully with all users',
        'Deliver work on time and meet agreed-upon standards',
        'Be honest about your skills and experience',
        'Respond to messages promptly and professionally'
      ]
    },
    {
      icon: <Handshake />,
      title: 'Fair Dealing',
      rules: [
        'Honor all agreements and contracts',
        'Provide accurate project descriptions and budgets',
        'Pay freelancers on time for completed work',
        'Resolve disputes through proper channels'
      ]
    },
    {
      icon: <Security />,
      title: 'Safety First',
      rules: [
        'Never share personal contact information outside the platform',
        'Report suspicious or inappropriate behavior immediately',
        'Use secure payment methods provided by SkillBridge',
        'Protect confidential client information and data'
      ]
    },
    {
      icon: <Star />,
      title: 'Quality Standards',
      rules: [
        'Deliver high-quality work that meets requirements',
        'Ask questions if project details are unclear',
        'Provide regular updates on project progress',
        'Request feedback and make necessary revisions'
      ]
    },
    {
      icon: <Gavel />,
      title: 'Legal Compliance',
      rules: [
        'Comply with all applicable laws and regulations',
        'Respect intellectual property rights',
        'Do not engage in fraudulent or deceptive practices',
        'Follow platform terms of service and policies'
      ]
    },
    {
      icon: <Report />,
      title: 'Reporting Issues',
      rules: [
        'Report policy violations or inappropriate content',
        'Use the dispute resolution process for conflicts',
        'Provide detailed information when reporting issues',
        'Cooperate with platform investigations when needed'
      ]
    }
  ];

  const violations = [
    {
      title: 'Prohibited Activities',
      items: [
        'Creating fake accounts or profiles',
        'Bidding on projects outside your expertise',
        'Copying or plagiarizing work from others',
        'Soliciting work outside the platform',
        'Posting discriminatory or offensive content',
        'Attempting to circumvent platform fees'
      ]
    },
    {
      title: 'Content Guidelines',
      items: [
        'No adult, violent, or illegal content',
        'No spam or promotional messages',
        'No false or misleading information',
        'No copyrighted material without permission',
        'No personal attacks or harassment',
        'No sharing of private conversations'
      ]
    }
  ];

  const consequences = [
    { level: 'Warning', description: 'First-time minor violations receive a warning' },
    { level: 'Temporary Suspension', description: 'Repeated violations may result in temporary account suspension' },
    { level: 'Permanent Ban', description: 'Serious violations result in permanent account termination' },
    { level: 'Legal Action', description: 'Illegal activities may be reported to authorities' }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Community Guidelines
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Our community guidelines help create a safe, professional, and positive 
            environment for everyone on SkillBridge.
          </Typography>
        </Box>
      </motion.div>

      {/* Guidelines Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
          Core Guidelines
        </Typography>
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {guidelines.map((guideline, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main', 
                    mx: 'auto', 
                    mb: 3,
                    width: 56,
                    height: 56
                  }}>
                    {guideline.icon}
                  </Avatar>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 3 }}>
                    {guideline.title}
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {guideline.rules.map((rule, ruleIndex) => (
                      <Typography component="li" variant="body2" key={ruleIndex} sx={{ mb: 1, lineHeight: 1.6 }}>
                        {rule}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Prohibited Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
          What's Not Allowed
        </Typography>
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {violations.map((violation, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'error.main', mb: 3 }}>
                    {violation.title}
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {violation.items.map((item, itemIndex) => (
                      <Typography component="li" variant="body1" key={itemIndex} sx={{ mb: 1.5, lineHeight: 1.7 }}>
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Consequences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
          Enforcement
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {consequences.map((consequence, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ textAlign: 'center', height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'warning.main' }}>
                    {consequence.level}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {consequence.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Appeal Process */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <Card>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Appeal Process
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, maxWidth: 700, mx: 'auto', mb: 3 }}>
              If you believe your account was suspended or terminated in error, you can appeal 
              the decision by contacting our support team. We review all appeals fairly and 
              will restore accounts when appropriate.
            </Typography>
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
              appeals@skillbridge.app
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default GuidelinesPage;


