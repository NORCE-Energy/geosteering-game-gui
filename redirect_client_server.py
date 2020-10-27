import http.server
import socketserver
import logging
import json
from simple_client import *


# This is a simple server that creates a local GUI using the same GUI as on the remote server
# The GUI implementation in HTML/JS is in the wwwroot folder


my_name = "new_user"
origin = 'http://game.geosteering.no'
my_cookies = log_me_in(base_url=origin, username=my_name + str(datetime.now()))
PORT = 9000


class MyHandler(http.server.SimpleHTTPRequestHandler):

    # self.cookies
    def __init__(self, *args, directory=None, **kwargs):
        super().__init__(*args, directory=None, **kwargs)
        # self.my_cookies = None

    def _write_result(self, result):
        self.send_response(200)
        self.end_headers()
        print(result)
        encoded = json.dumps(result).encode('utf-8')
        print(encoded)
        self.wfile.write(encoded)

    def do_GET(self):
        logging.info(self.headers)
        print('Path: {}'.format(self.path))
        # if self.path == '' or self.path == '/':
        #     self.path = 'wwwroot/login.html'
        #     super().do_GET()
        if self.path.startswith('/geo'):
            print('Redirecting get to origin')
            print('Path: {}'.format(self.path))
            # if self.path.startswith('/geo/init'):

            if self.path == "/geo/userdata":
                result = get_data(origin, my_cookies)
                print("got result: {}".format(result))
                self._write_result(result)
                return

            print('Should not come here! Get: {}'.format(self.path))
            self.send_response(404)
        else:
            self.path = 'wwwroot/' + self.path
            super().do_GET()
        # return
        # print(self.path)
        # self.send_response(301)
        # new_path = '%s%s' % ('http://game.geosteering.no', self.path)
        # self.send_header('Location', new_path)
        # self.end_headers()

    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])  # <--- Gets the size of data
            post_data = json.loads(self.rfile.read(content_length).decode('utf-8'))  # <--- Gets the data itself
        except:
            post_data = None

        # test_data = simplejson.loads(post_data)
        print('post_data type: {} : {}'.format(type(post_data), post_data))
        # print('user_name {}'.format(test_data))
        if self.path.startswith('/geo'):
            if self.path.startswith('/geo'):
                print('Redirecting post to origin')
                print('Path {}'.format(self.path))
                print('Posted data {}'.format(post_data))
                if self.path == "/geo/evaluate":
                    result = request_evaluation_raw(origin, my_cookies, post_data)
                    self._write_result(result)
                    return
                if self.path == "/geo/commitpoint":
                    result = commit_point(origin, my_cookies, post_data)
                    self._write_result(result)
                    return
                if self.path == "/geo/commitstop":
                    result = commit_stop_raw(origin, my_cookies)
                    self._write_result(result)
                    return
                if self.path == "/geo/newgame":
                    result = move_to_next_game(origin, my_cookies)
                    self._write_result(result)
                    return

        print('Should not come here! Post: {}'.format(self.path))
        self.send_response(404)


handler = socketserver.TCPServer(("", PORT), MyHandler)
print("serving at port {}".format(PORT))
handler.serve_forever()
