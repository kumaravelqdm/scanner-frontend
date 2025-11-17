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

export function Validate() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [result, setResult] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(true);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    // Force EAN13, CODE128, QR (best for small barcodes)
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.QR_CODE,
    ]);

    codeReader.hints = hints;

    // Start decoding from camera
    codeReader
      .decodeFromVideoDevice(
        null, // <-- FIXED: use null instead of undefined
        videoRef.current!,
        (result, _err) => {
          if (result) {
            setResult(result.getText());
            setIsScanning(false);
          }
        }
      )
      .catch((err) => console.error(err));

    return () => {
      codeReader.reset();
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
      </Box>

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
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {isScanning && (
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
            Waiting for barcode...
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default Validate;
