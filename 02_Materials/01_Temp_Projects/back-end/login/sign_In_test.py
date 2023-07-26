# sign_in_test.py
from oauth2client.contrib.flask_util import UserOAuth2
from flask import Flask, render_template, request, session, redirect, url_for

app = Flask(__name__)
app.config['SECRET_KEY'] = 'AIzaSyCHUx1bpNdKFMJ_3lvwaCbw15PabF1JNpw'

app.config['GOOGLE_OAUTH2_CLIENT_SECRETS_FILE'] = 'client_secret_9542596386-2kkmu7fkdv00p6pomousdniphu0job4i.apps.googleusercontent.com.json'

# or, specify the client id and secret separately
# app.config['GOOGLE_OAUTH2_CLIENT_ID'] = 'your-client-id'
# app.config['GOOGLE_OAUTH2_CLIENT_SECRET'] = 'your-client-secret'

oauth2 = UserOAuth2(app)

# Note that app.route should be the outermost decorator.
# 로그인
@app.route('/login')
@oauth2.required
def example():
    # http is authorized with the user's credentials and can be used
    # to make http calls.
    http = oauth2.http()
    # Or, you can access the credentials directly
    credentials = oauth2.credentials
    # 로그인 계정의 이메일과 사용자 id를 받아옴
    return "Hello, {} ({})".format(oauth2.email, oauth2.user_id)

# 계정 확인
@app.route('/optional')
def optional():
    if oauth2.has_credentials():
        return 'Credentials found!'
    else:
        return 'No credentials!'

# # 로그인
# @app.route('/login') 
# @oauth2.required # 로그인 화면
# def info():
#     return "Hello, {} ({})".format(oauth2.email, oauth2.user_id)

# 로그아웃
@app.route('/logout')
def logout():
    # Clear the user's session to log them out
    session.clear()
    return "{} ({})".format(oauth2.email, oauth2.user_id)

if __name__ == '__main__':
    app.run(port="8080", debug=True)