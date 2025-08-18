import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  CheckCircle,
  Error,
  Info,
} from '@mui/icons-material';
import { Word, CheckAnswerResponse } from '../types';
import { wordsApi, answersApi } from '../services/api';

interface StudyCardProps {
  onWordCompleted: () => void;
  favoriteOnly?: boolean;
}

export const StudyCard: React.FC<StudyCardProps> = ({ 
  onWordCompleted, 
  favoriteOnly = false 
}) => {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<CheckAnswerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNextWord = async () => {
    try {
      setLoading(true);
      setError(null);
      const word = await wordsApi.getStudyWord(favoriteOnly);
      setCurrentWord(word);
      setAnswer('');
      setResult(null);
    } catch (err: unknown) {
      setError('Failed to load word');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNextWord();
  }, [favoriteOnly]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWord || !answer.trim()) return;

    try {
      setLoading(true);
      const result = await answersApi.checkAnswer({
        wordId: currentWord.id,
        answer: answer.trim(),
      });
      
      setResult(result);
      
      if (result.isCorrect) {
        setTimeout(() => {
          onWordCompleted();
          loadNextWord();
        }, 2000);
      }
    } catch (err: unknown) {
      setError('Failed to check answer');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!currentWord) return;
    
    try {
      const updatedWord = await wordsApi.toggleFavorite(currentWord.id);
      setCurrentWord(updatedWord);
    } catch (err: unknown) {
      setError('Failed to toggle favorite');
    }
  };

  if (loading && !currentWord) {
    return (
      <Card sx={{ minWidth: 400, textAlign: 'center', p: 4 }}>
        <Typography>Loading...</Typography>
      </Card>
    );
  }

  if (error && !currentWord) {
    return (
      <Card sx={{ minWidth: 400, textAlign: 'center', p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadNextWord}>
          Try Again
        </Button>
      </Card>
    );
  }

  if (!currentWord) {
    return (
      <Card sx={{ minWidth: 400, textAlign: 'center', p: 4 }}>
        <Typography variant="h6" gutterBottom>
          No words available for study
        </Typography>
        <Typography color="text.secondary">
          {favoriteOnly 
            ? 'Add some words to favorites to study them' 
            : 'Add some words to start studying'
          }
        </Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ minWidth: 400, maxWidth: 600 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="div">
            {currentWord.russian}
          </Typography>
          <Tooltip title={currentWord.isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
            <IconButton onClick={handleToggleFavorite} color="primary">
              {currentWord.isFavorite ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          </Tooltip>
        </Box>

        <Box mb={3}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Example in Russian:
          </Typography>
          <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
            {currentWord.exampleRu}
          </Typography>
        </Box>

        <Box mb={3}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Example in English:
          </Typography>
          <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
            {currentWord.exampleEn}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Enter English word"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={loading || result?.isCorrect}
            autoFocus
            sx={{ mb: 2 }}
          />

          {result && (
            <Box mb={2}>
              {result.isCorrect ? (
                <Alert icon={<CheckCircle />} severity="success">
                  Correct! Well done!
                </Alert>
              ) : result.isPartial ? (
                <Alert icon={<Info />} severity="info">
                  {result.hint}
                </Alert>
              ) : (
                <Alert icon={<Error />} severity="error">
                  Incorrect. The correct answer is: <strong>{result.correctAnswer}</strong>
                </Alert>
              )}
            </Box>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || !answer.trim() || result?.isCorrect}
          >
            {loading ? 'Checking...' : 'Check Answer'}
          </Button>
        </form>

        {result && !result.isCorrect && (
          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 1 }}
            onClick={() => {
              setAnswer('');
              setResult(null);
            }}
          >
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
