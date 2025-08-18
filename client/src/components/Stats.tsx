import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';

import {
  School,
  Favorite,
  CheckCircle,
  TrendingUp,
  Psychology,
  Book,
} from '@mui/icons-material';
import { Stats } from '../types';
import { answersApi } from '../services/api';

export const StatsComponent: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await answersApi.getStats();
      setStats(statsData);
    } catch (err: unknown) {
      setError('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Words',
      value: stats.totalWords,
      icon: <Book color="primary" />,
      color: '#1976d2',
    },
    {
      title: 'Learned Words',
      value: stats.learnedWords,
      icon: <School color="success" />,
      color: '#2e7d32',
    },
    {
      title: 'Favorite Words',
      value: stats.favoriteWords,
      icon: <Favorite color="error" />,
      color: '#d32f2f',
    },
    {
      title: 'Total Answers',
      value: stats.totalAnswers,
      icon: <Psychology color="info" />,
      color: '#0288d1',
    },
    {
      title: 'Correct Answers',
      value: stats.correctAnswers,
      icon: <CheckCircle color="success" />,
      color: '#2e7d32',
    },
    {
      title: 'Accuracy',
      value: `${stats.accuracy}%`,
      icon: <TrendingUp color="warning" />,
      color: '#ed6c02',
    },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Learning Statistics
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        {statCards.map((card, index) => (
          <Card key={index} sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                {card.icon}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {card.title}
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ color: card.color }}>
                {card.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {stats.totalWords > 0 && (
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>
            Progress Overview
          </Typography>
          <Box display="flex" alignItems="center" mb={2}>
            <Box flex={1} mr={2}>
              <Box
                sx={{
                  width: '100%',
                  height: 20,
                  backgroundColor: '#e0e0e0',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: `${(stats.learnedWords / stats.totalWords) * 100}%`,
                    height: '100%',
                    backgroundColor: '#4caf50',
                    transition: 'width 0.3s ease',
                  }}
                />
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {Math.round((stats.learnedWords / stats.totalWords) * 100)}% learned
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};
