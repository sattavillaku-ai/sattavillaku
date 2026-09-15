/**
 * Google Drive Picker Client Integration for Sattavilakku
 * Uses Google Identity Services (GIS) + Google Picker API
 * Minimum necessary Drive permissions: https://www.googleapis.com/auth/drive.file
 */

export interface GoogleDrivePickedDoc {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes?: number;
  url?: string;
}

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

let gapiLoadedPromise: Promise<void> | null = null;
let gisLoadedPromise: Promise<void> | null = null;

export function loadGapiScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'));
  if (window.gapi && window.gapi.load) return Promise.resolve();

  if (!gapiLoadedPromise) {
    gapiLoadedPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.gapi.load('picker', () => resolve());
      };
      script.onerror = () => reject(new Error('Google API Client (api.js) ஏற்றுவதில் பிழை ஏற்பட்டது.'));
      document.body.appendChild(script);
    });
  }
  return gapiLoadedPromise;
}

export function loadGisScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'));
  if (window.google?.accounts?.oauth2) return Promise.resolve();

  if (!gisLoadedPromise) {
    gisLoadedPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Google Identity Services (gsi) ஏற்றுவதில் பிழை ஏற்பட்டது.'));
      document.body.appendChild(script);
    });
  }
  return gisLoadedPromise;
}

export interface OpenGooglePickerOptions {
  type: 'image' | 'pdf' | 'all';
  onSelect: (doc: GoogleDrivePickedDoc, accessToken: string) => void | Promise<void>;
  onCancel?: () => void;
  onError?: (err: Error) => void;
}

export async function openGoogleDrivePicker(options: OpenGooglePickerOptions): Promise<void> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PICKER_API_KEY;
  const appId = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_APP_ID;

  if (!clientId || !apiKey) {
    const errorMsg =
      'Google Drive Picker API நற்சான்றுகள் (.env) அமைக்கப்படவில்லை. தயவுசெய்து NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID மற்றும் NEXT_PUBLIC_GOOGLE_PICKER_API_KEY உள்ளிடவும்.';
    if (options.onError) {
      options.onError(new Error(errorMsg));
    } else {
      alert(errorMsg);
    }
    return;
  }

  try {
    // 1. Ensure scripts are loaded
    await Promise.all([loadGapiScript(), loadGisScript()]);

    // 2. Request OAuth Access Token with drive.file scope
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly',
      callback: async (tokenResponse: any) => {
        if (tokenResponse.error !== undefined) {
          console.error('Google OAuth token error:', tokenResponse);
          if (options.onError) {
            options.onError(new Error(tokenResponse.error_description || tokenResponse.error));
          }
          return;
        }

        const accessToken = tokenResponse.access_token;
        if (!accessToken) {
          if (options.onError) options.onError(new Error('Google Access Token பெற முடியவில்லை.'));
          return;
        }

        // 3. Build Google Picker
        createPicker(accessToken, apiKey, appId, options);
      },
    });

    // Prompt user to grant permission
    tokenClient.requestAccessToken({ prompt: '' });
  } catch (err: any) {
    console.error('Failed to open Google Drive picker:', err);
    if (options.onError) options.onError(err);
  }
}

function createPicker(
  accessToken: string,
  apiKey: string,
  appId: string | undefined,
  options: OpenGooglePickerOptions
) {
  const google = window.google;
  const pickerBuilder = new google.picker.PickerBuilder()
    .setDeveloperKey(apiKey)
    .setOAuthToken(accessToken)
    .setLocale('ta') // Tamil if supported, with English fallback
    .setCallback(async (data: any) => {
      if (data.action === google.picker.Action.PICKED) {
        const doc = data.docs?.[0];
        if (doc) {
          const pickedDoc: GoogleDrivePickedDoc = {
            id: doc.id,
            name: doc.name,
            mimeType: doc.mimeType,
            sizeBytes: doc.sizeBytes ? Number(doc.sizeBytes) : undefined,
            url: doc.url,
          };
          await options.onSelect(pickedDoc, accessToken);
        }
      } else if (data.action === google.picker.Action.CANCEL) {
        if (options.onCancel) options.onCancel();
      }
    });

  if (appId) {
    pickerBuilder.setAppId(appId);
  }

  // Views by type
  if (options.type === 'pdf') {
    const docsView = new google.picker.DocsView(google.picker.ViewId.PDFS)
      .setMimeTypes('application/pdf')
      .setMode(google.picker.DocsViewMode.LIST);
    pickerBuilder.addView(docsView);
    pickerBuilder.setTitle('சட்டவிளக்கு இதழ் PDF ஐத் தேர்ந்தெடுக்கவும்');
  } else if (options.type === 'image') {
    const imgView = new google.picker.DocsView(google.picker.ViewId.DOCS_IMAGES)
      .setMimeTypes('image/jpeg,image/png,image/webp,image/svg+xml')
      .setMode(google.picker.DocsViewMode.GRID);
    pickerBuilder.addView(imgView);
    pickerBuilder.setTitle('சட்டவிளக்கு படத்தைத் தேர்ந்தெடுக்கவும்');
  } else {
    pickerBuilder.addView(google.picker.ViewId.DOCS_IMAGES);
    pickerBuilder.addView(google.picker.ViewId.PDFS);
  }

  const picker = pickerBuilder.build();
  picker.setVisible(true);
}
