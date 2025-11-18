import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from "@zxing/library";
import {
  Container,
  Box,
  Typography,
  Card,
  Chip,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { CameraAlt } from "@mui/icons-material";

export function ValidateV1() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [result, setResult] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    // Enhanced hints for better detection
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.CODE_128,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_39,
      BarcodeFormat.QR_CODE,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true); // CRITICAL: Better for small/low quality
    
    codeReader.hints = hints;

    const startScanning = async () => {
      try {
        // Request camera with advanced constraints for AUTOFOCUS
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },  // Higher resolution for small barcodes
            height: { ideal: 1080 },
            // @ts-ignore - Advanced camera features
            advanced: [
              { focusMode: "continuous" },
              { zoom: 2.0 } // Slight zoom helps with small barcodes
            ]
          }
        } as any);

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Wait for video to be ready
          await new Promise((resolve) => {
            if (videoRef.current) {
              videoRef.current.onloadedmetadata = resolve;
            }
          });

          // Apply CONTINUOUS AUTOFOCUS to video track
          const videoTrack = stream.getVideoTracks()[0];
          const capabilities = videoTrack.getCapabilities();
          
          // @ts-ignore - Check if continuous focus is supported
          if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
            await videoTrack.applyConstraints({
              // @ts-ignore
              advanced: [{ focusMode: 'continuous' }]
            });
          }

          // Start continuous scanning with decodeFromVideoDevice
          codeReader.decodeFromVideoDevice(
            null,
            videoRef.current,
            (result:any, err:any) => {
              if (result) {
                setResult(result.getText());
                setIsScanning(false);
                // Stop scanning after successful read
                if (streamRef.current) {
                  streamRef.current.getTracks().forEach(track => track.stop());
                }
              }
              // Suppress "not found" errors (normal during scanning)
              if (err && !(err.name === 'NotFoundException')) {
                console.error(err);
              }
            }
          );
        }
      } catch (err: any) {
        setError(`Camera error: ${err.message}`);
        console.error(err);
      }
    };

    startScanning();

    return () => {
      codeReader.reset();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 2 }}>
          <CameraAlt sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Barcode Scanner
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary">
          Point your camera at a barcode to scan
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
          ✓ Autofocus enabled • ✓ Optimized for small barcodes
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3, overflow: "hidden", boxShadow: 3 }}>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            paddingBottom: "100%",
            backgroundColor: "#000",
            overflow: "hidden",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {isScanning && !error && (
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
              }}
            >
              <CircularProgress sx={{ color: "primary.main" }} />
              <Typography variant="body2" sx={{ color: "white", mt: 1 }}>
                Scanning...
              </Typography>
            </Box>
          )}
          
          {/* Scanning guide overlay for better positioning */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "80%",
              height: "30%",
              border: "2px solid rgba(0, 255, 0, 0.5)",
              borderRadius: 2,
              pointerEvents: "none",
            }}
          />
        </Box>
      </Card>

      {result ? (
        <Paper elevation={2} sx={{ p: 3, backgroundColor: "success.light" }}>
          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
            Scan Result
          </Typography>
          <Chip
            label={result}
            color="success"
            variant="outlined"
            sx={{ fontSize: "1rem", p: 2, width: "100%" }}
          />
          <Alert severity="success" sx={{ mt: 2 }}>
            Barcode successfully scanned!
          </Alert>
        </Paper>
      ) : (
        <Box sx={{ textAlign: "center", py: 2 }}>
          <Typography variant="body2" color="textSecondary">
            {error ? "Please allow camera access" : "Waiting for barcode..."}
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default ValidateV1;