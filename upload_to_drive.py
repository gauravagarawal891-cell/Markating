import os
import pickle
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ['https://www.googleapis.com/auth/drive.file']

def get_credentials(client_secrets_path):
    token_file = 'token.pickle'
    creds = None

    if os.path.exists(token_file):
        with open(token_file, 'rb') as token:
            creds = pickle.load(token)
            print('[✓] Loaded cached token')

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print('[→] Refreshing token...')
            creds.refresh(Request())
        else:
            if not os.path.exists(client_secrets_path):
                raise FileNotFoundError(f"Missing {client_secrets_path}")
            
            flow = InstalledAppFlow.from_client_secrets_file(client_secrets_path, SCOPES)
            print('[→] Auth required - opening browser or use manual code entry...')
            try:
                creds = flow.run_local_server(port=0, open_browser=True, timeout_seconds=120)
                print('[✓] Browser auth successful')
            except Exception as e:
                print(f'[!] Browser auth failed: {e}')
                print('[→] Falling back to manual code entry...')
                auth_url, _ = flow.authorization_url()
                print(f'\nVisit this URL:\n{auth_url}\n')
                code = input('Paste the authorization code here: ').strip()
                flow.fetch_token(code=code)
                creds = flow.credentials
                print('[✓] Manual code auth successful')

        with open(token_file, 'wb') as token:
            pickle.dump(creds, token)

    return creds

def upload_file(filepath, creds, folder_id=None):
    from googleapiclient.errors import HttpError
    import time
    
    service = build('drive', 'v3', credentials=creds)
    file_metadata = {'name': os.path.basename(filepath)}
    if folder_id:
        file_metadata['parents'] = [folder_id]
    
    media = MediaFileUpload(filepath, mimetype='text/csv', resumable=True)
    request = service.files().create(body=file_metadata, media_body=media, fields='id,webViewLink')
    
    print(f'[→] Uploading {os.path.basename(filepath)} with retries...')
    
    # Retry logic
    for attempt in range(3):
        try:
            response = None
            while response is None:
                status, response = request.next_chunk()
                if status:
                    print(f'  Progress: {int(status.progress() * 100)}%')
            print('[✓] Upload succeeded')
            return response
        except HttpError as e:
            if attempt < 2:
                print(f'[!] Attempt {attempt + 1} failed: {e.resp.status}. Retrying...')
                time.sleep(2 ** attempt)  # exponential backoff
            else:
                raise
        except Exception as e:
            if attempt < 2:
                print(f'[!] Attempt {attempt + 1} failed: {e}. Retrying...')
                time.sleep(2 ** attempt)
            else:
                raise

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Upload file to Google Drive')
    parser.add_argument('--file', '-f', required=True, help='File to upload')
    parser.add_argument('--secrets', '-s', default='client_secrets.json', help='Secrets JSON path')
    parser.add_argument('--folder', help='Drive folder ID')
    args = parser.parse_args()

    filepath = os.path.abspath(args.file)
    if not os.path.exists(filepath):
        print(f'[✗] File not found: {filepath}')
        raise SystemExit(1)

    try:
        creds = get_credentials(os.path.abspath(args.secrets))
        res = upload_file(filepath, creds, folder_id=args.folder)
        print('\n[✓] Upload complete!')
        print(f'File ID: {res.get("id")}')
        print(f'Link: {res.get("webViewLink")}')
    except Exception as e:
        print(f'[✗] Error: {e}')
        import traceback
        traceback.print_exc()
        raise SystemExit(1)
