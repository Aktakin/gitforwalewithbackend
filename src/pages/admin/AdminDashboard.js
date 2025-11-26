import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Paper,
  Avatar,
  Chip,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Dashboard,
  People,
  Flag,
  Security,
  Analytics,
  Payment,
  TrendingUp,
  TrendingDown,
  PersonAdd,
  Block,
  CheckCircle,
  Warning,
  MonetizationOn,
  Visibility,
  Edit,
  Delete,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Mock data for demonstrations
  const dashboardStats = [
    { title: 'Total Users', value: '12,457', change: '+12%', icon: People, color: 'primary' },
    { title: 'Active Skills', value: '3,842', change: '+8%', icon: TrendingUp, color: 'success' },
    { title: 'Total Revenue', value: '$284,592', change: '+15%', icon: MonetizationOn, color: 'info' },
    { title: 'Pending Reports', value: '23', change: '-5%', icon: Flag, color: 'warning' },
  ];

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Provider', status: 'Active', joinDate: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Customer', status: 'Active', joinDate: '2024-01-14' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Both', status: 'Suspended', joinDate: '2024-01-13' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Provider', status: 'Pending', joinDate: '2024-01-12' },
  ];

  const flaggedContent = [
    { id: 1, type: 'Skill', title: 'Web Development Services', reporter: 'user123', reason: 'Spam', status: 'Pending', date: '2024-01-15' },
    { id: 2, type: 'Review', title: 'Poor service quality', reporter: 'customer456', reason: 'Inappropriate', status: 'Under Review', date: '2024-01-14' },
    { id: 3, type: 'Message', title: 'Inappropriate language', reporter: 'provider789', reason: 'Harassment', status: 'Resolved', date: '2024-01-13' },
  ];

  const paymentDisputes = [
    { id: 1, orderId: 'ORD-001', customer: 'John Doe', provider: 'Jane Smith', amount: '$250', reason: 'Service not delivered', status: 'Open', date: '2024-01-15' },
    { id: 2, orderId: 'ORD-002', customer: 'Mike Wilson', provider: 'Sarah Davis', amount: '$180', reason: 'Quality issues', status: 'In Progress', date: '2024-01-14' },
    { id: 3, orderId: 'ORD-003', customer: 'Tom Brown', provider: 'Lisa Johnson', amount: '$320', reason: 'Late delivery', status: 'Resolved', date: '2024-01-13' },
  ];

  const StatCard = ({ stat }) => {
    const IconComponent = stat.icon;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          sx={{
            height: '100%',
            background: `linear-gradient(135deg, ${theme.palette[stat.color].main}15, ${theme.palette[stat.color].main}05)`,
            border: `1px solid ${alpha(theme.palette[stat.color].main, 0.1)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 8px 25px ${alpha(theme.palette[stat.color].main, 0.15)}`,
            },
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {stat.title}
                </Typography>
                <Chip
                  label={stat.change}
                  size="small"
                  color={stat.change.startsWith('+') ? 'success' : 'error'}
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: alpha(theme.palette[stat.color].main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconComponent sx={{ fontSize: 32, color: `${stat.color}.main` }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1E90FF 0%, #5BB3FF 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Admin Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage your SkillBridge platform with powerful admin tools
          </Typography>
        </Box>
      </motion.div>

      {/* Dashboard Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {dashboardStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard stat={stat} />
          </Grid>
        ))}
      </Grid>

      {/* Admin Tabs */}
      <Paper sx={{ borderRadius: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              '& .MuiTab-root': {
                minHeight: 64,
                fontWeight: 600,
              },
            }}
          >
            <Tab
              icon={<Dashboard />}
              label="Overview"
              iconPosition="start"
              sx={{ gap: 1 }}
            />
            <Tab
              icon={<People />}
              label="User Management"
              iconPosition="start"
              sx={{ gap: 1 }}
            />
            <Tab
              icon={<Flag />}
              label="Reports & Flags"
              iconPosition="start"
              sx={{ gap: 1 }}
            />
            <Tab
              icon={<Security />}
              label="Content Moderation"
              iconPosition="start"
              sx={{ gap: 1 }}
            />
            <Tab
              icon={<Analytics />}
              label="Analytics"
              iconPosition="start"
              sx={{ gap: 1 }}
            />
            <Tab
              icon={<Payment />}
              label="Payments & Disputes"
              iconPosition="start"
              sx={{ gap: 1 }}
            />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Platform Growth
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'action.hover', borderRadius: 2 }}>
                    <Typography variant="body1" color="text.secondary">
                      Analytics Chart Placeholder
                      <br />
                      (Revenue, Users, Skills growth over time)
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<PersonAdd />}
                      fullWidth
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Add New Admin
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Flag />}
                      fullWidth
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Review Reports
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Analytics />}
                      fullWidth
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      View Analytics
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<MonetizationOn />}
                      fullWidth
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      Payment Settings
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* User Management Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              User Management
            </Typography>
            <Button variant="contained" startIcon={<PersonAdd />}>
              Add User
            </Button>
          </Box>
          
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Join Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {user.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {user.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={user.role === 'Provider' ? 'primary' : user.role === 'Customer' ? 'secondary' : 'info'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        size="small"
                        color={user.status === 'Active' ? 'success' : user.status === 'Suspended' ? 'error' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>{user.joinDate}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" color="primary">
                          <Visibility />
                        </IconButton>
                        <IconButton size="small" color="info">
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <Block />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Reports & Flags Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Flagged Content & Reports
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review and moderate reported content from users
            </Typography>
          </Box>
          
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Content Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reporter</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {flaggedContent.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Chip
                        label={item.type}
                        size="small"
                        color={item.type === 'Skill' ? 'primary' : item.type === 'Review' ? 'secondary' : 'info'}
                      />
                    </TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.reporter}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.reason}
                        size="small"
                        color={item.reason === 'Spam' ? 'warning' : item.reason === 'Inappropriate' ? 'error' : 'info'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        size="small"
                        color={item.status === 'Pending' ? 'warning' : item.status === 'Under Review' ? 'info' : 'success'}
                      />
                    </TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="outlined" color="success">
                          Approve
                        </Button>
                        <Button size="small" variant="outlined" color="error">
                          Remove
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Content Moderation Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Moderation Queue
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
                      <Typography variant="body2">Skills pending approval</Typography>
                      <Chip label="12" color="warning" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
                      <Typography variant="body2">Reviews pending approval</Typography>
                      <Chip label="8" color="info" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
                      <Typography variant="body2">User profiles flagged</Typography>
                      <Chip label="3" color="error" size="small" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Auto-Moderation Settings
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>Spam Detection</Typography>
                      <LinearProgress variant="determinate" value={85} color="success" />
                      <Typography variant="caption" color="text.secondary">85% accuracy</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>Inappropriate Content Filter</Typography>
                      <LinearProgress variant="determinate" value={92} color="success" />
                      <Typography variant="caption" color="text.secondary">92% accuracy</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>Fake Profile Detection</Typography>
                      <LinearProgress variant="determinate" value={78} color="warning" />
                      <Typography variant="caption" color="text.secondary">78% accuracy</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Platform Analytics
                  </Typography>
                  <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'action.hover', borderRadius: 2 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                      Advanced Analytics Dashboard
                      <br />
                      - User engagement metrics
                      <br />
                      - Revenue trends
                      <br />
                      - Popular skill categories
                      <br />
                      - Geographic distribution
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Key Metrics
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Daily Active Users</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>2,847</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Conversion Rate</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>12.4%</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Avg. Order Value</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>$156</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Top Categories
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {['Technology', 'Design', 'Writing', 'Marketing'].map((category, index) => (
                        <Box key={category} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">{category}</Typography>
                          <Chip label={`${[35, 28, 19, 18][index]}%`} size="small" />
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Payments & Disputes Tab */}
        <TabPanel value={tabValue} index={5}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Payment & Dispute Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage payment disputes and financial transactions
            </Typography>
          </Box>
          
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Provider</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paymentDisputes.map((dispute) => (
                  <TableRow key={dispute.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{dispute.orderId}</TableCell>
                    <TableCell>{dispute.customer}</TableCell>
                    <TableCell>{dispute.provider}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'success.main' }}>{dispute.amount}</TableCell>
                    <TableCell>{dispute.reason}</TableCell>
                    <TableCell>
                      <Chip
                        label={dispute.status}
                        size="small"
                        color={dispute.status === 'Open' ? 'error' : dispute.status === 'In Progress' ? 'warning' : 'success'}
                      />
                    </TableCell>
                    <TableCell>{dispute.date}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="outlined" color="primary">
                          Review
                        </Button>
                        <Button size="small" variant="outlined" color="success">
                          Resolve
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;
