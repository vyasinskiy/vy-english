import React, { useState, useEffect, useRef } from 'react';
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
  Snackbar,
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
  const [isExampleRevealed, setIsExampleRevealed] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [todayCorrectAnswers, setTodayCorrectAnswers] = useState(0);
  const autoAdvanceTimeoutRef = useRef<number | null>(null);

  const loadNextWord = async (excludeCurrent: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const word = await wordsApi.getStudyWord(
        favoriteOnly,
        excludeCurrent && currentWord ? currentWord.id : undefined
      );
      setCurrentWord(word);
      setAnswer('');
      setResult(null);
      setIsExampleRevealed(false);
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
      setTodayCorrectAnswers(result.todayCorrectAnswers);
      setSnackbarOpen(true);
      
      if (result.isCorrect) {
        if (autoAdvanceTimeoutRef.current) {
          window.clearTimeout(autoAdvanceTimeoutRef.current);
          autoAdvanceTimeoutRef.current = null;
        }
        autoAdvanceTimeoutRef.current = window.setTimeout(() => {
          onWordCompleted();
          loadNextWord();
          autoAdvanceTimeoutRef.current = null;
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

  const handleRevealExample = () => {
    if (!isExampleRevealed) {
      setIsExampleRevealed(true);
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
        <Button variant="contained" onClick={() => loadNextWord()}>
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
    <>
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
          <Box
            onClick={handleRevealExample}
            sx={{
              position: 'relative',
              cursor: isExampleRevealed ? 'default' : 'pointer',
              userSelect: isExampleRevealed ? 'text' : 'none',
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontStyle: 'italic',
                filter: isExampleRevealed ? 'none' : 'blur(6px)',
                transition: 'filter 0.2s ease',
              }}
            >
              {currentWord.exampleEn}
            </Typography>
            {!isExampleRevealed && (
              <Chip
                size="small"
                label="Click to reveal"
                color="primary"
                sx={{ position: 'absolute', top: -8, right: 0 }}
              />
            )}
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Enter English word"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={loading || result?.isCorrect || isExampleRevealed}
            autoFocus
            sx={{ mb: 2 }}
          />

          {isExampleRevealed && (
            <Box mb={2}>
              <Alert icon={<Info />} severity="info">
                English example revealed. Input is locked. Click Next to continue.
              </Alert>
            </Box>
          )}

          {result && (
            <Box mb={2}>
              {result.isCorrect ? (
                <Alert icon={<CheckCircle />} severity="success">
                  Correct! Well done!
                </Alert>
              ) : result.isSynonym ? (
                <Alert icon={<Info />} severity="info">
                  Это синоним. Попробуйте другое слово.
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
            disabled={loading || !answer.trim() || result?.isCorrect || isExampleRevealed}
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

        <Button
          variant="text"
          fullWidth
          sx={{ mt: 1 }}
          disabled={loading}
          onClick={() => {
            if (autoAdvanceTimeoutRef.current) {
              window.clearTimeout(autoAdvanceTimeoutRef.current);
              autoAdvanceTimeoutRef.current = null;
            }
            if (result?.isCorrect) {
              onWordCompleted();
            }
            loadNextWord(true);
          }}
        >
          Next
        </Button>
      </CardContent>
    </Card>
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={3000}
      onClose={() => setSnackbarOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={() => setSnackbarOpen(false)} severity="info" sx={{ width: '100%' }}>
        Correct answers today: {todayCorrectAnswers}
      </Alert>
    </Snackbar>
    </>
  );
};
