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
  TextField,
  Button,
  IconButton,
  Divider,
} from "@mui/material";
import { CameraAlt, Add, Delete, CheckCircle } from "@mui/icons-material";

interface MetadataField {
  key: string;
  value: string;
}

export function ValidateV1() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  
  // Authentication state
  const [accessKey, setAccessKey] = useState<string>("");
  // const [accessKey, setAccessKey] = useState<string>("ak_9Lod0MOhFULPPRVumbhyqA==");
  const [secret, setSecret] = useState<string>("");
  // const [secret, setSecret] = useState<string>("p4iPqAWQ0aTWOG8qHgXxfSefLR8adEWHrjEJzls4D30=");
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  
  // Metadata state
  const [metadata, setMetadata] = useState<MetadataField[]>([{ key: "", value: "" }]);
  // const [metadata, setMetadata] = useState<MetadataField[]>([{ key: "store", value: "1" }, { key: "name", value: "ak" }]);
  const [metadataSet, setMetadataSet] = useState<boolean>(false);
  
  // Scanning state
  const [result, setResult] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  // const [serverUrl] = useState<string>("http://localhost:8080");
  const [serverUrl] = useState<string>("https://scanner-backend-iy9y.onrender.com");

  // Verify API Key
  const handleVerifyKey = async () => {
    if (!accessKey || !secret) {
      setAuthError("Please enter both access key and secret");
      return;
    }

    setVerifying(true);
    setAuthError("");

    try {
      const response = await fetch(`${serverUrl}/api/v1/verify-key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessKey: accessKey.trim(),
          secret: secret.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.valid) {
        setAuthError(data.error || "Invalid API credentials");
        setIsVerified(false);
      } else {
        setIsVerified(true);
        console.log("✓ API Key verified successfully");
      }
    } catch (err: any) {
      setAuthError(`Verification failed: ${err.message}`);
      setIsVerified(false);
    } finally {
      setVerifying(false);
    }
  };

  // Add metadata field
  const handleAddMetadataField = () => {
    setMetadata([...metadata, { key: "", value: "" }]);
  };

  // Remove metadata field
  const handleRemoveMetadataField = (index: number) => {
    const newMetadata = metadata.filter((_, i) => i !== index);
    setMetadata(newMetadata.length > 0 ? newMetadata : [{ key: "", value: "" }]);
  };

  // Update metadata field
  const handleMetadataChange = (index: number, field: "key" | "value", value: string) => {
    const newMetadata = [...metadata];
    newMetadata[index][field] = value;
    setMetadata(newMetadata);
  };

  // Confirm metadata
  const handleConfirmMetadata = () => {
    // Filter out empty fields
    const validMetadata = metadata.filter((m) => m.key.trim() !== "");
    if (validMetadata.length === 0) {
      setMetadata([{ key: "", value: "" }]);
    } else {
      setMetadata(validMetadata);
    }
    setMetadataSet(true);
  };

  // Log scan to backend
  const logScanToBackend = async (scannedCode: string, scanType: string, format: string) => {
    try {
      // Convert metadata array to object
      const metadataObject = metadata.reduce((acc, { key, value }) => {
        if (key.trim() !== "") {
          acc[key.trim()] = value.trim();
        }
        return acc;
      }, {} as Record<string, string>);

      const response = await fetch(`${serverUrl}/api/v1/log-scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessKey}`,
        },
        body: JSON.stringify({
          scannedCode,
          scanType,
          scanResult: {
            format,
            text: scannedCode,
          },
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
          },
          metadata: metadataObject,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.warn("Failed to log scan:", await response.text());
      } else {
        console.log("✓ Scan logged successfully");
      }
    } catch (err) {
      console.error("Error logging scan:", err);
    }
  };

 // 1) Bit-flag map (ZXing-style flags / powers of two)
const bitFlagMap: Record<number, string> = {
  1: "AZTEC",
  2: "CODABAR",
  4: "CODE_39",
  8: "CODE_93",
  16: "CODE_128",
  32: "DATA_MATRIX",
  64: "EAN_8",
  128: "EAN_13",
  256: "ITF",
  512: "MAXICODE",
  1024: "PDF_417",
  2048: "QR_CODE",
  4096: "UPC_A",
  8192: "UPC_E"
};

// 2) Legacy / enum-style numeric map (small integer codes used by some devices/libs)
const enumNumericMap: Record<number, string> = {
  1: "AZTEC",
  2: "CODABAR",
  3: "CODE_39",
  4: "CODE_93",
  5: "CODE_128",  // example (some libs differ) — keep for safety
  6: "DATA_MATRIX",
  7: "EAN_8",
  8: "EAN_13",
  9: "ITF",
  10: "MAXICODE",
  11: "PDF_417",
  12: "QR_CODE",
  13: "UPC_A",
  14: "CODE_128", // <<--- important: maps 14 => CODE_128 for scanners returning "14"
  15: "UPC_E"
  // add/adjust entries to match your scanner if you know exact enum values
};

// Utility: try to get a format name from the numeric value
const resolveFormatNameFromNumber = (num: number): string | undefined => {
  // 1) direct lookup in enum-style map
  if (enumNumericMap[num]) return enumNumericMap[num];

  // 2) direct lookup in bit-flag map
  if (bitFlagMap[num]) return bitFlagMap[num];

  // 3) if num looks like a bitmask (sum of flags), try to find the dominant single flag
  //    Prefer single-flag matches (powers of two). If it's not a pure single-flag,
  //    attempt to find the highest set flag and return that (best-effort).
  for (const flagStr of Object.keys(bitFlagMap)) {
    const flag = Number(flagStr);
    if ((num & flag) === flag) {
      return bitFlagMap[flag];
    }
  }

  // 4) nothing matched
  return undefined;
};

// Final robust getScanType
const getScanType = (format: string | number): "QR" | "BARCODE" | "OTHER" => {
  let formatName: string | undefined;

  if (typeof format === "string") {
    if (/^[0-9]+$/.test(format)) {
      // numeric-as-string like "14"
      const num = Number(format);
      formatName = resolveFormatNameFromNumber(num);
    } else {
      // name-as-string like "CODE_128"
      formatName = format;
    }
  } else if (typeof format === "number") {
    formatName = resolveFormatNameFromNumber(format);
  }

  if (!formatName) return "OTHER";

  const qrFormats = ["QR_CODE", "DATA_MATRIX", "AZTEC", "MAXICODE"];
  if (qrFormats.includes(formatName)) return "QR";

  const barcodeFormats = [
    "EAN_13", "EAN_8", "UPC_A", "UPC_E",
    "CODE_128", "CODE_39", "CODE_93",
    "CODABAR", "ITF", "PDF_417"
  ];
  if (barcodeFormats.includes(formatName)) return "BARCODE";

  return "OTHER";
};


  // Start scanning
  useEffect(() => {
    if (!isVerified || !metadataSet) {
      return;
    }

    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    // Enhanced hints for better detection
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.CODE_128,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_39,
      BarcodeFormat.QR_CODE,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    codeReader.hints = hints;

    const startScanning = async () => {
      setIsScanning(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            // @ts-ignore - Advanced camera features
            advanced: [
              { focusMode: "continuous" },
              { zoom: 2.0 },
            ],
          },
        } as any);

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          await new Promise((resolve) => {
            if (videoRef.current) {
              videoRef.current.onloadedmetadata = resolve;
            }
          });

          const videoTrack = stream.getVideoTracks()[0];
          const capabilities = videoTrack.getCapabilities();

          // @ts-ignore - Apply continuous autofocus
          if (capabilities.focusMode && capabilities.focusMode.includes("continuous")) {
            await videoTrack.applyConstraints({
              // @ts-ignore
              advanced: [{ focusMode: "continuous" }],
            });
          }

          // Start continuous scanning
          codeReader.decodeFromVideoDevice(null, videoRef.current, async (scanResult: any, err: any) => {
            if (scanResult) {
              const scannedText = scanResult.getText();
              const format = scanResult.getBarcodeFormat().toString();
              const scanType = getScanType(format);

              // Only log if scan type is not OTHER
              if (scanType !== "OTHER") {
                setResult(scannedText);
                setIsScanning(false);

                // Log scan to backend
                await logScanToBackend(scannedText, scanType, format);

                // Stop scanning after successful read
                if (streamRef.current) {
                  streamRef.current.getTracks().forEach((track) => track.stop());
                }
              }
            }
            // Suppress "not found" errors
            if (err && !(err.name === "NotFoundException")) {
              console.error(err);
            }
          });
        }
      } catch (err: any) {
        setError(`Camera error: ${err.message}`);
        setIsScanning(false);
        console.error(err);
      }
    };

    startScanning();

    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVerified, metadataSet]);

  // Render API Key Verification Form
  if (!isVerified) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            API Key Verification
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Enter your API credentials to start scanning
          </Typography>
        </Box>

        <Card sx={{ p: 4, boxShadow: 3 }}>
          {authError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {authError}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Access Key"
              variant="outlined"
              fullWidth
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              placeholder="ak_xxxxxxxxxxxxx"
            />

            <TextField
              label="Secret"
              variant="outlined"
              type="password"
              fullWidth
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter your secret"
            />

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleVerifyKey}
              disabled={verifying}
              sx={{ mt: 2 }}
            >
              {verifying ? <CircularProgress size={24} /> : "Verify API Key"}
            </Button>
          </Box>
        </Card>
      </Container>
    );
  }

  // Render Metadata Collection Form
  if (!metadataSet) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <CheckCircle sx={{ fontSize: 48, color: "success.main", mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            API Key Verified!
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Add custom additional data to track with each scan
          </Typography>
        </Box>

        <Card sx={{ p: 4, boxShadow: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Custom Additional Data (Optional)
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {metadata.map((field, index) => (
              <Box key={index} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <TextField
                  label="Key"
                  variant="outlined"
                  size="small"
                  value={field.key}
                  onChange={(e) => handleMetadataChange(index, "key", e.target.value)}
                  placeholder="e.g., location"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Value"
                  variant="outlined"
                  size="small"
                  value={field.value}
                  onChange={(e) => handleMetadataChange(index, "value", e.target.value)}
                  placeholder="e.g., warehouse-A"
                  sx={{ flex: 1 }}
                />
                {metadata.length > 1 && (
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveMetadataField(index)}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                )}
              </Box>
            ))}

            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAddMetadataField}
              sx={{ mt: 1 }}
            >
              Add Field
            </Button>

            <Divider sx={{ my: 2 }} />

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleConfirmMetadata}
              sx={{ mt: 2 }}
            >
              Continue to Scan
            </Button>
          </Box>
        </Card>
      </Container>
    );
  }

  // Render Scanner (Original UI preserved)
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
        <Typography variant="caption" color="textSecondary" sx={{ display: "block", mt: 1 }}>
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

          {/* Scanning guide overlay */}
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
            Barcode successfully scanned and logged!
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