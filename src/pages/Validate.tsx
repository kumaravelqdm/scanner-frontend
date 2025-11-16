import { useState } from "react";
import { useZxing, DecodeHintType } from "react-zxing";
import {
  Container,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Alert,
  Button,
  Paper,
} from "@mui/material";
import { QrCode, Copy, CheckCircle, AlertCircle } from "lucide-react";
import { BarcodeFormat } from "@zxing/library";

export const Validate = () => {
  const [barcode, setBarcode] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const hints = new Map<DecodeHintType, any>();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.QR_CODE,
  ]);

  const { ref } = useZxing({
    constraints: {
      video: {
        facingMode: "environment",
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    },
    hints,
    onDecodeResult(result) {
      setBarcode(result.getText());
      setError("");
    },
    onDecodeError() {
      if (!error) setError("Scanning...");
    },
  });

  const handleCopy = () => {
    if (barcode) {
      navigator.clipboard.writeText(barcode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setBarcode("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <Container maxWidth="md">
        <div className="space-y-6">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <QrCode className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <Typography variant="h3" className="font-bold text-gray-900 mb-2">
              Scanner Validator
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Scan QR codes and barcodes in real-time
            </Typography>
          </div>

          {/* Scanner Card */}
          <Card className="shadow-lg">
            <CardHeader
              title="Live Scanner"
              subheader="Point your camera at a QR code or barcode"
              titleTypographyProps={{ variant: "h6" }}
            />
            <CardContent>
              <Box className="flex flex-col items-center gap-6 relative">

                {/* SCAN BOX OVERLAY */}
                <Box className="absolute z-10 border-4 border-white/70 rounded-xl w-64 h-32 pointer-events-none"></Box>

                <Paper
                  elevation={3}
                  className="overflow-hidden bg-black rounded-lg relative"
                >
                  <video
                    ref={ref}
                    className="w-full h-96 object-cover"
                  />
                </Paper>

                {/* Status Indicator */}
                <Box className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <Typography variant="body2" className="text-green-600">
                    Scanner active
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card className="shadow-lg">
            <CardHeader
              title="Scan Result"
              titleTypographyProps={{ variant: "h6" }}
            />
            <CardContent className="space-y-4">
              {barcode ? (
                <div className="space-y-4">
                  <Box className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <Box className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <Typography variant="subtitle2" className="text-green-900">
                        Barcode Detected
                      </Typography>
                    </Box>
                    <Paper className="bg-white p-3 rounded border border-green-100 font-mono text-sm break-all">
                      {barcode}
                    </Paper>
                  </Box>

                  <Box className="flex gap-3">
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Copy className="h-4 w-4" />}
                      onClick={handleCopy}
                      fullWidth
                    >
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleReset}
                      fullWidth
                    >
                      Reset
                    </Button>
                  </Box>
                </div>
              ) : (
                <Box className="text-center py-8">
                  <QrCode className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <Typography variant="body2" className="text-gray-500">
                    No barcode detected yet
                  </Typography>
                  <Typography variant="caption" className="text-gray-400">
                    Position a QR code or barcode in front of your camera
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && error !== "Scanning..." && (
            <Alert
              severity="warning"
              icon={<AlertCircle className="h-5 w-5" />}
              onClose={() => setError("")}
              className="rounded-lg"
            >
              {error}
            </Alert>
          )}

          {/* Info Card */}
          <Card className="bg-blue-50 border border-blue-200">
            <CardContent>
              <Box className="flex gap-3">
                <QrCode className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <Typography variant="subtitle2" className="text-blue-900 font-semibold">
                    Tips for best results:
                  </Typography>
                  <Typography variant="body2" className="text-blue-800 mt-1">
                    • Ensure good lighting
                    <br />
                    • Keep the code steady in frame
                    <br />
                    • Clear any obstructions
                    <br />
                    • Move closer for small Code128 barcodes
                    <br />
                    • Center the barcode inside the white scan box
                  </Typography>
                </div>
              </Box>
            </CardContent>
          </Card>

        </div>
      </Container>
    </div>
  );
};
