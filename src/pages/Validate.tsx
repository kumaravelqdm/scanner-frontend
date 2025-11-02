import React, { useState, useRef } from 'react';
import { Box, Button, TextField, Typography, Alert, Tabs, Tab, CircularProgress } from '@mui/material';

import * as RealScannerModule from 'real-scanner';
const RealScanner = RealScannerModule.RealScanner;

export const Validate: React.FC = () => {
  const [accessKey, setAccessKey] = useState('');
  const [secret, setSecret] = useState('');
  const [scanner, setScanner] = useState<any | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleValidate = async () => {
    setError(null);
    setSuccess(null);
    setScanResult(null);
    try {
      const realScanner = new RealScanner({
        accessKey,
        secret,
        onScanSuccess: (result: any) => {
          setScanResult(result.getText());
        },
        onScanError: (err: any) => {
          setError(err.message || 'Scan error');
        }
      });
      const valid = await realScanner.initialize();
      if (valid) {
        setScanner(realScanner);
        setIsReady(true);
        setSuccess('API Key validated successfully!');
      } else {
        setError('Invalid API credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Validation failed');
    }
  };

  const handleStartScanning = async () => {
    if (!scanner || !videoRef.current) return;
    setScanning(true);
    setScanResult(null);
    setError(null);
    try {
      await scanner.startScanning({ videoElement: videoRef.current });
    } catch (err: any) {
      setError(err.message || 'Failed to start scanning');
    }
    setScanning(false);
  };

  const handleStopScanning = () => {
    if (scanner) {
      scanner.stopScanning();
      setScanning(false);
    }
  };

  return (
    <Box maxWidth={500} mx="auto" mt={8} p={4} boxShadow={3} borderRadius={2} bgcolor="#fff">
      <Typography variant="h5" mb={2} fontWeight={700}>Validate API Key</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Validate" />
        <Tab label="Video Scan" disabled={!isReady} />
      </Tabs>
      {tab === 0 && (
        <>
          <TextField
            label="Access Key"
            fullWidth
            margin="normal"
            value={accessKey}
            onChange={e => setAccessKey(e.target.value)}
          />
          <TextField
            label="Secret Key"
            fullWidth
            margin="normal"
            type="password"
            value={secret}
            onChange={e => setSecret(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, mb: 2 }}
            onClick={handleValidate}
            disabled={!accessKey || !secret}
          >
            Validate
          </Button>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {isReady && (
            <Alert severity="info">Scanner is ready! You can now use scanning features.</Alert>
          )}
        </>
      )}
      {tab === 1 && (
        <Box>
          <Typography mb={2}>Scan QR/Barcode using your camera</Typography>
          <video ref={videoRef} width={400} height={300} style={{ borderRadius: 8, border: '1px solid #ccc' }} autoPlay muted />
          <Box display="flex" gap={2} mt={2}>
            <Button
              variant="contained"
              color="success"
              onClick={handleStartScanning}
              disabled={scanning}
            >
              {scanning ? <CircularProgress size={20} /> : 'Start Scanning'}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleStopScanning}
              disabled={!scanning}
            >
              Stop
            </Button>
          </Box>
          {scanResult && (
            <Alert severity="success" sx={{ mt: 2 }}>Scanned: {scanResult}</Alert>
          )}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Box>
      )}
    </Box>
  );
};
