# Image Assets

Place your branded images in this directory:

## Required Images:

1. **logo.png** - Your Real Scanner logo (recommended size: 240x240px or higher)
   - This will be displayed prominently on the left side of login/signup pages
   - Should have a transparent background for best results

2. **login-bg.png** - The login background image you provided
   - Shows barcode, QR code, lock icon, and fingerprint
   - Will be used as background overlay on the left side of login page

3. **signup-bg.png** - The signup background image you provided  
   - Shows barcode, QR code, user icon, and fingerprint
   - Will be used as background overlay on the left side of signup page

## Usage:

The images are referenced in the code as:
- `/src/assets/images/logo.png`
- `/src/assets/images/login-bg.png`  
- `/src/assets/images/signup-bg.png`

## Implementation:

Currently the images are referenced but you need to:
1. Save your provided images in this folder with the correct names
2. Uncomment the import statements in Login.tsx and Signup.tsx
3. The layout will automatically use them

## Layout:

- **Desktop**: Split-screen with image on left, form on right
- **Mobile**: Stacked layout with image overlay at top, form below
- **Logo**: Displayed prominently with "Real Scanner" branding text