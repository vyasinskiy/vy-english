import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  School,
  List,
  Favorite,
  BarChart,
} from '@mui/icons-material';
import { StudyCard } from './components/StudyCard';
import { WordList } from './components/WordList';
import { StatsComponent } from './components/Stats';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [wordsUpdated, setWordsUpdated] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleWordCompleted = () => {
    setWordsUpdated(prev => prev + 1);
  };

  const handleWordUpdated = () => {
    setWordsUpdated(prev => prev + 1);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              English Words Learning App
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="app tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab 
                icon={<School />} 
                label="Study" 
                iconPosition="start"
              />
              <Tab 
                icon={<Favorite />} 
                label="Favorites" 
                iconPosition="start"
              />
              <Tab 
                icon={<List />} 
                label="Words List" 
                iconPosition="start"
              />
              <Tab 
                icon={<BarChart />} 
                label="Statistics" 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box display="flex" justifyContent="center">
              <StudyCard 
                onWordCompleted={handleWordCompleted}
                favoriteOnly={false}
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box display="flex" justifyContent="center">
              <StudyCard 
                onWordCompleted={handleWordCompleted}
                favoriteOnly={true}
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <WordList onWordUpdated={handleWordUpdated} />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <StatsComponent />
          </TabPanel>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
