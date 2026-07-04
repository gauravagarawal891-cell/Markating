import json
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
INQUIRIES_FILE = os.path.join(ROOT_DIR, 'inquiries.json')

class MarketingRequestHandler(SimpleHTTPRequestHandler):
    def send_json(self, data, status=200):
        response = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(response)))
        self.end_headers()
        self.wfile.write(response)

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")

    def do_POST(self):
        if self.path != '/api/inquiry':
            self.send_error(404, 'Not Found')
            return

        content_length = int(self.headers.get('Content-Length', 0))
        content_type = self.headers.get('Content-Type', '')

        if 'application/json' not in content_type:
            self.send_error(400, 'Expected application/json')
            return

        body = self.rfile.read(content_length)
        try:
            data = json.loads(body.decode('utf-8'))
        except json.JSONDecodeError:
            self.send_error(400, 'Invalid JSON')
            return

        if not data.get('name') or not data.get('email'):
            self.send_error(400, 'Name and email are required')
            return

        inquiry = {
            'name': data.get('name', '').strip(),
            'business': data.get('business', '').strip(),
            'email': data.get('email', '').strip(),
            'phone': data.get('phone', '').strip(),
            'package': data.get('package', '').strip(),
            'service': data.get('service', '').strip(),
            'message': data.get('message', '').strip(),
            'url': self.path,
        }

        self.save_inquiry(inquiry)
        print(f"Received inquiry from {inquiry['name']} <{inquiry['email']}>")
        self.send_json({'success': True, 'message': 'Inquiry received.'})

    def save_inquiry(self, inquiry):
        inquiries = []
        if os.path.exists(INQUIRIES_FILE):
            try:
                with open(INQUIRIES_FILE, 'r', encoding='utf-8') as handle:
                    inquiries = json.load(handle)
            except (json.JSONDecodeError, OSError):
                inquiries = []

        inquiries.append(inquiry)

        with open(INQUIRIES_FILE, 'w', encoding='utf-8') as handle:
            json.dump(inquiries, handle, indent=2, ensure_ascii=False)

    def translate_path(self, path):
        if path == '/':
            path = '/index.html'
        return os.path.join(ROOT_DIR, path.lstrip('/'))


def run(server_class=HTTPServer, handler_class=MarketingRequestHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Serving on http://localhost:{port}')
    print('Press Ctrl+C to stop.')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped.')
        httpd.server_close()


if __name__ == '__main__':
    run()
